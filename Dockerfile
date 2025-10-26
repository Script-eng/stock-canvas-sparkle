# --- Stage 1: Build the app ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (allow peer conflicts)
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build for production
RUN npm run build


# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# Optional: custom nginx.conf (for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
