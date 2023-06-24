Token handler pattern using nginx and redis
===

This is a proof of concept for the token handler pattern using nginx, javascript and redis.
Background information can be found on:

https://curity.io/resources/learn/the-token-handler-pattern

# Project structure

- `/conf` holds the nginx configuration of the server and endpoints
- `/docs` holds documents that are used for designing the solution
- `/modules` holds the compiled module to connect nginx to redis
- `/njs` holds the nginx javascript files
- `/rest-calls` holds the intellij http scripts for debugging
- `docker-compose.yml` is used to start nginx and redis and mount the folders to nginx

# Start nginx and redis

To start nginx and redis together there is a [docker-compose.yml](docker-compose.yml) file:

```bash
docker compose up
```

To shutdown run:

```bash
docker compose down -v --remove-orphans
```

After startup:
- nginx: http://localhost:8080
  - see [rest-calls/nginx-requests.http](rest-calls/nginx-requests.http) for example requests
- redis-insight: http://localhost:8001
  - for visual inspection of redis server content

# njs code

njs is a nginx javascript implementation and it does not have full ES6 support (i.e. object destructuring)

Supported javascript features are documented: http://nginx.org/en/docs/njs/compatibility.html

There is an [njs example repository](https://github.com/nginx/njs-examples)

# Compile dynamic module for redis

nginx does not come with redis support built-in. There is a 3rd party dynamic module for that, which you
have to compile yourself. The binary is included in the project files: `/modules/ngx_http_redis2_module.so`.
It was build with nginx version [1.25.1](http://nginx.org/download/nginx-1.25.1.tar.gz) 
and redis2redis2-nginx-module version [v0.15](https://github.com/openresty/redis2-nginx-module/archive/refs/tags/v0.15.tar.gz)

Background information: https://www.nginx.com/blog/compiling-dynamic-modules-nginx-plus/#build-module

- Compiling the sources should be done in Linux (WSL Ubuntu 20.04.6 LTS was used for this POC)
- Download the dependencies for building the software

```bash
sudo apt-get build-dep nginx
```

- Download and extract the sources
  for [redis2-nginx-module v0.15](https://github.com/openresty/redis2-nginx-module/tags)

```bash
 wget https://github.com/openresty/redis2-nginx-module/archive/refs/tags/v0.15.tar.gz
 tar -xzvf v0.15.tar.gz
```

- Download and extract the sources for [nginx 1.25.1](http://nginx.org/en/download.html)

```bash
 wget https://github.com/openresty/redis2-nginx-module/archive/refs/tags/v0.15.tar.gz
 tar -xzvf v0.15.tar.gz
```

- Then compile the source as dynamic
  module [nginx manual](https://www.nginx.com/blog/compiling-dynamic-modules-nginx-plus/#build-module)

```bash
./configure --add-dynamic-module=../redis2-nginx-module-0.15 \
            --with-compat
make module
```

- The compiled module `ngx_http_redis2_module.so` can be found in the `objs` folder
- Copy it to the `modules` folder in this project. It is mounted to the image in the docker-compose.yml

# Reload nginx config

When nginx is running you can reload any changes to the nginx.conf or javascript files.

Open a terminal to the nginx server (using docker) and run:

```bash
nginx -s reload
```
