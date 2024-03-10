# Remote Proxy Plugin For Vite

# Who is this for?

A lot of older React codebases are still bundling CSR bundles into proprietary back-end frameworks which are hosted on a server while still developing VIA FTP, or any other method of transfering files to the server.

What this plugin tries to achieve is an development ecosystem where you do not have to run your server-side back-end locally to just be able to develop projects while still being able to pass data, render different views from server and let routing be handled by back-end as well.

## Example

Plugin should always be provided as below vite core plugins.

#### vite.config.js

```

import remoteProxyPlugin from "vite-remote-proxy-plugin";

let target = "http://domain.com";

export default defineConfig({
  plugins: [
    react(),
    remoteProxyPlugin({
      target: target,
      bundles: [{ dataName: "public", entryPoint: "src/main.jsx" }],
      headers: {
        "remote-dev-server": "yes",
      },
    }),
  ],
  server: {
    host: "localhost",
    port: 8080,
  },
});

```

# Usage

Back-end should have script tags with data-name property on the bundles wished to be replaced, which then are provided in the bundles argument with also the entrypoint of local development.

Preferably domain should be able to serve development via HTTP to avoid CORS errors - but is also possible to set up with HTTPS, given if set up correctly.

## Reference

#### Plugin params

```
| Parameter | Type     | Description                                                                                 |
| :-------- | :------- | :--------------------------------                                                           |
| target    | `string` | **Required**. Target domain to proxy                                                        |
| bundles   | `array`  | **Required**. Entrypoints for the bundle as well as data-name property served on the server |
| headers   | `string` | Additional headers to send to server                                                        |
```

## License

The Remote Proxy Plugin is open-sourced software licensed under the [ MIT license](https://choosealicense.com/licenses/mit/)
