# Variables AWS du projet Mini-Flotte
# Utilisation, dans chaque nouveau terminal :   source deploy/env.sh
export AWS_PROFILE=flotte
export AWS_REGION=eu-north-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo "Compte : $AWS_ACCOUNT_ID | Région : $AWS_REGION | Registre : $ECR_REGISTRY"
