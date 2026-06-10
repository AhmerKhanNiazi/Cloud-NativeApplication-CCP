# Full Stack Cloud-Native Application Deployment

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

A completely serverless, scalable, and highly available Cloud-Native Web Application designed and deployed on Amazon Web Services (AWS) using Infrastructure as Code (IaC) principles. 

This repository contains the complete source code, infrastructure definitions, and documentation for the Complex Computing Problem (CCP) assignment for the Cloud Computing & Virtualization course.

---

## 🚀 Architecture Overview

The system is designed with a **Zero-Trust Security** model and **Serverless-First** architecture, ensuring it scales automatically from zero to millions of requests without manual intervention, while remaining highly cost-effective.

* **Frontend:** A responsive, premium Glassmorphism UI built with **React.js**. Hosted globally using **Amazon S3** Static Website Hosting.
* **API Gateway:** **Amazon API Gateway** acts as the front door, proxying HTTP requests securely to the backend logic.
* **Compute / Backend:** **AWS Lambda** runs a Python **FastAPI** application via Mangum adapters, providing stateless, infinitely scalable compute.
* **Database:** **Amazon DynamoDB** serves as the fully managed NoSQL database for ultra-fast, single-digit millisecond latency data storage.
* **Infrastructure as Code:** **Terraform** is utilized to declaratively provision, manage, and tear down the entire AWS ecosystem.
* **Authentication (Ready):** **Amazon Cognito** user pools and clients are provisioned for future JWT-based access control.

## 📁 Repository Structure

```text
📦 Cloud-NativeApplication-CCP
 ┣ 📂 backend                 # AWS Lambda Python Logic
 ┃ ┣ 📜 app.py                # FastAPI Application & Mangum Handler
 ┃ ┗ 📜 requirements.txt      # Python Dependencies
 ┣ 📂 frontend                # React.js Premium UI
 ┃ ┣ 📂 public                # Static HTML
 ┃ ┣ 📂 src                   # React Components & CSS (Glassmorphism)
 ┃ ┗ 📜 package.json          # Node Dependencies
 ┣ 📂 infra                   # Terraform IaC Definitions
 ┃ ┣ 📜 main.tf               # Core AWS Resources Configuration
 ┃ ┣ 📜 variables.tf          # Configurable Input Variables
 ┃ ┗ 📜 outputs.tf            # Generated URLs and IDs
 ┗ 📜 README.md               # Documentation
```

## ✨ Features

- **Automated Deployment Pipeline:** The entire AWS environment (VPC, IAM Roles, S3, API Gateway, Lambda, DynamoDB, Cognito) is brought up using a single `terraform apply` command.
- **Cross-Platform Compilation:** Python dependencies (like `pydantic-core`) are explicitly packaged using `manylinux` wheels to ensure perfect compatibility with Amazon Linux 2 Lambda environments.
- **CORS Enabled:** Secure Cross-Origin Resource Sharing is implemented at the FastAPI middleware layer, allowing seamless communication between S3 and the API Gateway.
- **Aesthetic Premium UI:** Features a modern dark-mode interface with floating animations, gradients, and frosted glass components.

## 🛠️ Deployment Instructions

### Prerequisites
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured with appropriate IAM credentials.
- [Terraform](https://developer.hashicorp.com/terraform/downloads) v1.5.0+ installed.
- [Node.js](https://nodejs.org/en) & npm.
- Python 3.10+

### Step 1: Provision Infrastructure
Navigate to the `infra` directory and apply the Terraform configuration:
```bash
cd infra
terraform init
terraform apply -auto-approve
```
*Note down the generated `api_url` from the Terraform outputs.*

### Step 2: Deploy Backend (AWS Lambda)
Package and update the Lambda code:
```bash
cd backend
pip install --platform manylinux2014_x86_64 --target=package --implementation cp --python-version 3.10 --only-binary=:all: --upgrade -r requirements.txt
cp app.py package/
cd package
zip -r ../deployment_package.zip .
cd ..
aws lambda update-function-code --function-name ccp-backend-function --zip-file fileb://deployment_package.zip
```

### Step 3: Deploy Frontend (Amazon S3)
Inject the API URL and build the React app:
```bash
cd frontend
export REACT_APP_API_URL="<your_api_url_from_step_1>"
npm install
npm run build
aws s3 sync build/ s3://<your_s3_bucket_name> --delete
```

## 🛡️ Security & Cost Analysis

- **Least Privilege:** The AWS Lambda execution role strictly only has permissions to `AssumeRole`, write to CloudWatch Logs, and perform specific CRUD operations on the exact DynamoDB table ARN.
- **Cost Effective:** Being entirely serverless, the application costs $0.00 when idle. You only pay per request (Lambda invocations) and per GB of storage (S3/DynamoDB).

---
*Developed for the Cloud Computing & Virtualization Course (CCP).*
