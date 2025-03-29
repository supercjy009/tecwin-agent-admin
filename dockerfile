# 使用轻量级 Nginx 镜像作为基础
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 删除默认 Nginx 静态文件
RUN rm -rf ./*

# 将本地 dist 目录内容复制到容器
COPY dist .

# 暴露 80 端口（HTTP）
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]