#!/bin/bash

# docker-exec.sh: Execute commands inside a Docker Compose service container.
# Usage: ./docker-exec.sh [options] <command> [args...]
# Options:
#   -s, --service SERVICE_NAME  Specify the service name (overrides auto-detection).
#   -h, --help                  Display this help message.

# Function to display usage information
usage() {
  echo "docker-exec.sh: Execute commands inside a Docker Compose service container."
  echo "Usage: $0 [options] <command> [args...]"
  echo "Options:"
  echo "  -s, --service SERVICE_NAME  Specify the service name (overrides auto-detection)."
  echo "  -h, --help                  Display this help message."
}

# Function to detect the first service name from docker-compose.yml
detect_service_name() {
  local service
  service=$(grep -E '^\s{2}[a-zA-Z0-9_-]+:\s*$' docker-compose.yml | head -n 1 | tr -d ': ')
  echo "$service"
}

# Function to determine the available Docker Compose command
detect_docker_compose_command() {
  if command -v docker-compose &> /dev/null; then
    echo "docker-compose"
  elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "docker compose"
  else
    echo "Error: Neither 'docker-compose' nor 'docker compose' is installed." >&2
    exit 1
  fi
}

# Parse options
SERVICE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -s|--service)
      SERVICE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

# Ensure a command is provided
if [ $# -eq 0 ]; then
  echo "Error: No command provided."
  usage
  exit 1
fi

# Auto-detect service name if not provided
if [ -z "$SERVICE" ]; then
  SERVICE=$(detect_service_name)
  if [ -z "$SERVICE" ]; then
    echo "Error: Unable to detect service name. Please specify it using the -s option."
    exit 1
  fi
fi

# Determine the appropriate Docker Compose command
DOCKER_COMPOSE_CMD=$(detect_docker_compose_command)

# Check if the container is running; if not, start it
if ! $DOCKER_COMPOSE_CMD ps "$SERVICE" | grep -q 'Up'; then
  echo "Service '$SERVICE' is not running. Starting it..."
  $DOCKER_COMPOSE_CMD up -d "$SERVICE"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to start service '$SERVICE'."
    exit 1
  fi
fi

# Execute the provided command inside the service container
$DOCKER_COMPOSE_CMD exec "$SERVICE" "$@"
