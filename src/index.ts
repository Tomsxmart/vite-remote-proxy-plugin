
import { parse } from "node-html-parser";
import chalk from 'chalk';

interface PluginConfig {
  /**
   * Target domain to proxy
   * 
   */
  target: string
  
  /**
   * Specification for bundles according to the application
   * 
   */
  bundles: BundlesConfig[]

  /**
   * Additional headers to pass to proxy domain 
   * @default null
   */
  headers?: HeadersConfig,

}

interface BundlesConfig {
    dataName:string,
    entryPoint:string,
}

interface HeadersConfig {
    [key:string]:string
}


export const remoteProxyPlugin = ({ target, headers, bundles} : PluginConfig) =>  {
  let config;
  return {
    name: "vite-remote-proxy-plugin", // Required, will show up in warnings and errors
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      const message =
        chalk.gray(new Date().toLocaleTimeString()) +
        chalk.bold.red(' [remote-proxy-plugin] ') +
        chalk.bold.cyan('Running proxy: ' + target);
        console.log(message);
    },
    configureServer({ middlewares }) {
      middlewares.use(async (req, res, next) => {
        const ignoreUrls = [
          "/node_modules",
          "/src",
          "/@vite",
          "/@react-refresh",
        ];

        // Ignore specific routes coming from back-end
        if (ignoreUrls.some((url) => req.url.startsWith(url))) {
          return next();
        }

        // Now we try to read the remote URL
        const response = await fetch(`${target}${req.url}`, {
          headers: headers,
        });

        if (!response.ok) {
          return res.end("Not found");
        }

        // Preparing data..
        const contentType = response.headers.get("content-type");
        const responseBody = await response.text();
        const parsedHtml = parse(responseBody);

        // Modify and remove appending scripts that are served from the server to prevent override
        modifyHTML({ parsedHtml, config, bundles });

        

        // Sending response back to client
        res.setHeader("content-type", contentType);
        res.end(parsedHtml.toString());
      });
    },
  };
}


const modifyHTML = ({ parsedHtml, config, bundles }) => {
  const { host, port } = config.server;

  //Injecting HMR functionality into head
  const headEl = parsedHtml.querySelector("head");

  if (headEl !== null) {
    headEl.insertAdjacentHTML(
      "beforebegin",
      `<script type="module">
        import { injectIntoGlobalHook } from "/@react-refresh";
        injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
      </script>`
    );
  }
  //TODO: Remove related css files from the document to prevent style override in development 

  // Modify existing bundles to redirect to local uri's 
  bundles.forEach((bundle) => {
    const { dataName, entryPoint } = bundle;
    const elements = parsedHtml.querySelectorAll(`[data-name="${dataName}"]`);

    elements.forEach((item) => {
      // check if the provided file is imported by using href or src
      const source = item.getAttribute("href") !== undefined ? "href" : "src";
      const bundleLoc = new URL(item.getAttribute(source));

      // possibly refactor this to deconstruct but keep URL properties?
      bundleLoc.hostname = host;
      bundleLoc.pathname = entryPoint;
      bundleLoc.port = port;
      bundleLoc.protocol = "http";

      item.setAttribute(source, bundleLoc.toString());
    });
  });
};

export default remoteProxyPlugin;