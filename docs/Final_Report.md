# Full Stack Cloud-Native Application Deployment Using AWS

## 1. Introduction
This project simulates the deployment of a fully functional web-based application entirely on AWS. It demonstrates a cloud-native architecture using AWS managed services to ensure scalability, high availability, fault tolerance, and cost efficiency.

## 2. Literature Review / Related Work
Cloud-native applications utilize modern cloud computing paradigms such as microservices, serverless compute, and Infrastructure as Code (IaC). This architecture shifts the burden of server maintenance to the cloud provider (AWS), enabling developers to focus solely on business logic and rapid deployment through automated pipelines. Serverless architectures specifically excel in handling variable workloads while optimizing costs through a pay-per-use model.

## 3. System Design & Architecture Diagram
The architecture is designed around a serverless paradigm. The frontend is a React application hosted statically on an Amazon S3 bucket, distributed globally via CloudFront. The backend consists of an AWS API Gateway routing requests to an AWS Lambda function written in Python. Data persistence is handled by Amazon DynamoDB, a fully managed NoSQL database. Authentication is managed through AWS Cognito. All infrastructure provisioning is automated using Terraform.

*(Refer to architecture.md for the visual diagram)*

## 4. Methodology
The implementation was carried out in multiple automated steps:
- **Infrastructure as Code:** Terraform was used to declare and provision all AWS resources (S3, DynamoDB, API Gateway, Cognito, IAM roles).
- **Backend API:** A RESTful API was developed using Python (FastAPI/Mangum) and packaged for AWS Lambda deployment.
- **Frontend UI:** A React SPA was built to interact with the backend API and handle user inputs.
- **CI/CD:** GitHub Actions workflows were established to automatically test and deploy code changes to S3 and Lambda.
- **Monitoring:** CloudWatch was configured to track API errors and Lambda execution metrics.

## 5. Source Code Repositories
The project is structured into the following directories:
- `infra/`: Contains Terraform templates (`main.tf`, `variables.tf`, `outputs.tf`).
- `backend/`: Contains the AWS Lambda Python source code and requirements.
- `frontend/`: Contains the React user interface application.
- `.github/workflows/`: Contains the CI/CD pipeline configuration files.
- `monitoring/`: Contains CloudWatch dashboard and alarm configurations.

## 6. Results & Discussion
The application successfully deployed a highly scalable architecture. By leveraging AWS Lambda and DynamoDB, the application scales automatically to meet demand without pre-provisioning servers. The CI/CD pipelines ensure that any changes made to the GitHub repository are seamlessly rolled out to the production environment, reducing the manual deployment overhead.

## 7. Cost Analysis & Security Considerations
### Cost Analysis
The architecture utilizes the AWS Free Tier extensively:
- **AWS Lambda:** 1 million free requests per month.
- **Amazon DynamoDB:** 25 GB of storage and 2.5 million read/write operations free per month.
- **Amazon S3:** 5 GB of standard storage free for 12 months.
Overall, for a simulation and low-traffic environment, the estimated cost is $0/month.

### Security Considerations
- **IAM:** Least privilege principles were applied to the Lambda execution role, granting it access only to the necessary DynamoDB tables.
- **Authentication:** AWS Cognito secures user access.
- **Network Security:** Public access blocks were strictly configured on S3 buckets, leaving only CloudFront to securely serve traffic via HTTPS.

## 8. References
1. Amazon Web Services Documentation: Serverless Application Model (SAM).
2. Terraform by HashiCorp: AWS Provider Documentation.
3. React Documentation: Building Single Page Applications.
