#!/bin/bash
set -xe -o pipefail

test -f $(dirname $0)/lib-common.sh && source $(dirname $0)/lib-common.sh
trap clean EXIT QUIT KILL

# repo docker-ce
export DEBIAN_FRONTEND=noninteractive
mirror_docker="${MIRROR_DOCKER:-https://download.docker.com/linux/debian}"
mirror_docker_key="${MIRROR_DOCKER_KEY:-https://download.docker.com/linux/debian/gpg}"

# docker version, docker-compose
docker_version="docker-ce=5:19.03.11~3-0~debian-stretch"
docker_compose_version="1.21.2"

PACKAGE_CUSTOM="sudo make git unzip python-pip python-dev \
     python-openstackclient python-heatclient python-wheel \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
     software-properties-common \
     jq"

# conf apt / proxy (use http_proxy_common instead of http_proxy_shared, due to latency)
if [ -n "$http_proxy_common" ] ; then
  cat > /etc/apt/apt.conf.d/01proxy <<EOF_PROXY
Acquire::http::Proxy "$http_proxy_common";
Acquire::https::Proxy "$http_proxy_common";
EOF_PROXY
fi

# conf apt source list
if [ -n "$MIRROR_DEBIAN" ] ; then
  cat > /etc/apt/sources.list <<EOF
deb $MIRROR_DEBIAN/debian9 stretch main contrib non-free
deb $MIRROR_DEBIAN/debian9 stretch-backports main contrib non-free
deb $MIRROR_DEBIAN/debian9 stretch-updates main contrib non-free
deb $MIRROR_DEBIAN/debian9-security stretch/updates main contrib non-free
EOF
fi
#
## install core packages
apt_args="-o=Dpkg::Use-Pty=0"
apt-get -qq $apt_args update -qy
apt-get -qq $apt_args install -qy $PACKAGE_CUSTOM
#
# install docker
curl -fsSL $mirror_docker_key | apt-key add -
add-apt-repository \
     "deb [arch=amd64] $mirror_docker $(lsb_release -cs) stable"
apt-get -qq $apt_args update -qy
apt-get -qq $apt_args install -qy --allow-unauthenticated docker-ce
#
# install docker-compose
[ -z "$PYPI_URL" ] || pip_args=" --index-url $PYPI_URL "
[ -z "$PYPI_HOST" ] || pip_args="$pip_args --trusted-host $PYPI_HOST "
echo "$NO_PROXY" |tr ',' '\n' | sort -u |grep "^$PYPI_HOST$" || \
  [ -z "$HTTPS_PROXY" ] || pip_args="$pip_args --proxy $HTTPS_PROXY "

pip install $pip_args "docker-compose==$docker_compose_version"

cat <<EOF > pre-requirements.txt
pbr==4.0.0
multi-key-dict==2.0.3
python-openstackclient==3.14.2
yamllint==1.12.1
pathspec>=0.5.3
EOF
pip install $pip_args -I --no-deps -r ./pre-requirements.txt

# test docker docker-compose is present
docker version || exit $?
docker-compose version ||exit $?
# test openstack version
openstack  --version || exit $?

# clean all dummy container and images before start
docker system prune -f ||true

slack_notification "0" "Started"
