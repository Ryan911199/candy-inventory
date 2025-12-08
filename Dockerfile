FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY dist/ /usr/share/nginx/html/

# Fix file permissions for all files
RUN chmod -R 644 /usr/share/nginx/html/* && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
