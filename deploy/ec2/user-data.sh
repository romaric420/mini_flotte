#!/bin/bash
# =====================================================================
# Script exécuté UNE fois, en root, au premier démarrage du serveur EC2
# Journal complet : /var/log/user-data.log
# =====================================================================
set -euxo pipefail
exec > /var/log/user-data.log 2>&1

# 1. Mises à jour de sécurité du système
dnf update -y

# 2. Docker + l'assistant qui s'authentifie à ECR grâce au rôle IAM
dnf install -y docker amazon-ecr-credential-helper
systemctl enable --now docker
usermod -aG docker ec2-user

# 3. Plugin Docker Compose (commande "docker compose")
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 4. Docker utilise le rôle IAM pour ECR : aucun mot de passe stocké, aucun "docker login"
for h in /root /home/ec2-user; do
  mkdir -p "$h/.docker"
  echo '{ "credHelpers": { "747590900318.dkr.ecr.eu-north-1.amazonaws.com": "ecr-login" } }' > "$h/.docker/config.json"
done
chown -R ec2-user:ec2-user /home/ec2-user/.docker

# 5. Mémoire de secours (swap 2 Go) : filet de sécurité si la RAM est pleine
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 6. Dossier de l'application
mkdir -p /opt/flotte
chown ec2-user:ec2-user /opt/flotte

echo "===== USER-DATA TERMINE ====="
