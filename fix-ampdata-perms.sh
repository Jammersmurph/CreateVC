#!/usr/bin/env bash

set -euo pipefail

TARGET_DIR="${1:-/home/amp/.ampdata}"
AMP_USER="${AMP_USER:-amp}"
AMP_GROUP="${AMP_GROUP:-amp}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root, for example: sudo $0 ${TARGET_DIR}" >&2
  exit 1
fi

if [[ ! -d "${TARGET_DIR}" ]]; then
  echo "Target directory does not exist: ${TARGET_DIR}" >&2
  exit 1
fi

if ! id "${AMP_USER}" >/dev/null 2>&1; then
  echo "User does not exist: ${AMP_USER}" >&2
  exit 1
fi

if ! getent group "${AMP_GROUP}" >/dev/null 2>&1; then
  echo "Group does not exist: ${AMP_GROUP}" >&2
  exit 1
fi

echo "Updating ownership on ${TARGET_DIR}..."
chown -R "${AMP_USER}:${AMP_GROUP}" "${TARGET_DIR}"

echo "Updating directory permissions..."
find "${TARGET_DIR}" -type d -exec chmod u+rwx {} +

echo "Updating file permissions..."
find "${TARGET_DIR}" -type f -exec chmod u+rw {} +

echo "Done. ${AMP_USER} now has ownership and read/write access to ${TARGET_DIR}."
