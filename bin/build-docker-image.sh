#!/usr/bin/env bash

set -e

APP_NAME=${1:?build-docker-image.sh [app name] [image name] [tag]}
IMAGE_NAME=${2:?build-docker-image.sh [app name] [image name] [tag]}
TAG=${3:?build-docker-image.sh [app name] [image name] [tag]}
BUILD_NUM=${BUILD_NUM:?BUILD_NUM must be set}
BUILD_HASH=${CIRCLE_SHA1:?CIRCLE_SHA1 must be set}

# ensure up to date credentials (first so we fail fast if this isnt set up properly)
aws ecr get-login --no-include-email --region us-west-2 | sh
credstash get staging.kube.config > kubeconfig

# pare down our node_modules so container is smaller
yarn --production

# build / tag / deploy docker image
docker build --build-arg BUILD_NUM=$BUILD_NUM --build-arg BUILD_HASH=$BUILD_HASH --build-arg BUILD_TIME=$(date -Iminutes) --rm=false -t ${IMAGE_NAME} .
docker tag ${IMAGE_NAME} 000762380483.dkr.ecr.us-west-2.amazonaws.com/stridespark/${IMAGE_NAME}:${TAG}
docker push 000762380483.dkr.ecr.us-west-2.amazonaws.com/stridespark/${IMAGE_NAME}:${TAG}
echo published docker container 000762380483.dkr.ecr.us-west-2.amazonaws.com/stridespark/${IMAGE_NAME}:${TAG}

# update the kubes
if [[ "$CIRCLE_BRANCH" == "staging" ]]; then
    kubectl -n staging --kubeconfig=kubeconfig set image deployment/${APP_NAME} ${APP_NAME}=000762380483.dkr.ecr.us-west-2.amazonaws.com/stridespark/${IMAGE_NAME}:${TAG}
fi
