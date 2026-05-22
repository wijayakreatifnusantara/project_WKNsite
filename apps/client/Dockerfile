# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy packaging details
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy client source code
COPY . .

# Set Vite build argument (fallback to relative /api path for same-origin proxying)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy compiled assets from build stage to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
