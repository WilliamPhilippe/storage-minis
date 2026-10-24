#!/bin/sh
set -eu

# Only mount roots in Docker storage; never traverse or chown the checkout.
for volume in dependencies api-dependencies db-dependencies pnpm-store turbo; do
  chown 1000:1000 "/volumes/$volume"
done
