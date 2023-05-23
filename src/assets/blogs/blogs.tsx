export const blogData = [{
    title: 'Uploading Images to Cloudflare R2 using Bash and Rclone',
    content: `In today's technological era, the need for reliable and efficient data storage has become crucial. One of the solutions to address this requirement is to utilize cloud storage. Among several cloud storage providers, Cloudflare has recently introduced their R2 Storage service\n.

    Cloudflare R2 Storage is a cost-effective, S3-compatible cloud storage service that promises zero egress bandwidth fees and doesn’t charge for data transfer. 

    But, how can we upload our data, specifically images, to Cloudflare R2? One efficient way is to use a command-line program called Rclone, combined with a Bash script.

    Rclone is a command-line program to sync files and directories to and from many different storage backends including cloud storage providers. And Bash is a Unix shell and command language which is widely used in many operating systems.

    The script for uploading images to Cloudflare R2 using Bash and Rclone would look something like this:

    \`\`\`
    #!/bin/bash

    for file in /path/to/your/images/*; do
        rclone copy $file cloudflare:bucket
    done
    \`\`\`

    This simple script will iterate over each file in the directory you specify (/path/to/your/images/*) and use Rclone's 'copy' command to upload each one to your specified Cloudflare bucket. 

    To execute this script, you'd run the following command in your terminal:

    \`\`\`
    bash your_script.sh
    \`\`\`

    Before running this script, make sure you've installed and configured Rclone with Cloudflare R2. 

    Please note, you may need to be adjusted based on your specific needs. Always remember to test your scripts thoroughly before running them on production data.`,
    date: '2023-05-22',
    author: 'Usama Aslam',
    image: '../../assets/pictures/blog4.jpg', // Update the path as needed
},
{
    title: 'Deploying Cloud Functions in Node.js using Apollo Studio on AWS, Azure and GCP through Terraform',
    content: `Cloud computing has revolutionized the way we develop and deploy applications. Specifically, serverless architectures, where you don't have to manage any servers, are becoming increasingly popular. Today, we'll look at how to deploy a cloud function in Node.js using Apollo Studio on three popular cloud platforms: Amazon Web Services (AWS), Azure, and Google Cloud Platform (GCP).

    Apollo Studio is a comprehensive platform for managing your data graph. It provides features like schema tracking, metrics, and enhanced security.

    Terraform is an infrastructure as code (IaC) tool, which allows you to create, update, and version your infrastructure safely and efficiently.

    The first step to deploying your cloud function is to create your Node.js function. This will be the code that is executed when your function is called.

    Then, you'll want to set up your environment in Apollo Studio. This will involve creating a new service, and setting up your schema.

    Once you've set up your service in Apollo Studio, you can then use Terraform to create a new resource for your cloud function. You'll need to configure the provider for your chosen cloud platform (AWS, Azure, or GCP), and then define your function as a new resource.

    Here is an example of what this might look like for an AWS Lambda function:

    \`\`\`
    provider "aws" {
        region = "us-west-2"
    }

    resource "aws_lambda_function" {
        function_name = "my-function"
        role          = aws_iam_role.iam_for_lambda.arn
        handler       = "index.handler"
        runtime       = "nodejs14.x"

        source_code_hash = filebase64sha256("index.js.zip")
    }
    \`\`\`

    For an GCP function:
    \`\`\`
    provider "google" {
        project = "<PROJECT_ID>"
        region  = "us-central1"
      }
      
      resource "google_cloudfunctions_function" "function" {
        name        = "function-name"
        description = "My function deployed with Apollo Studio"
        runtime     = "nodejs14"
      
        available_memory_mb   = 256
        source_archive_bucket = "<SOURCE_BUCKET>"
        source_archive_object = "<SOURCE_OBJECT>"
        trigger_http          = true
        entry_point           = "apolloHandler"
      }
    \`\`\`

    For an Azure function:
    \`\`\`
    provider "azurerm" {
        features {}
      }
      
      resource "azurerm_function_app" "example" {
        name                       = "apolloFunctionApp"
        location                   = azurerm_resource_group.example.location
        resource_group_name        = azurerm_resource_group.example.name
        app_service_plan_id        = azurerm_app_service_plan.example.id
        storage_account_name       = azurerm_storage_account.example.name
        storage_account_access_key = azurerm_storage_account.example.primary_access_key
        os_type                    = "linux"
        https_only                 = true
      
        runtime_version = "~3"
        version         = "~3"
      }
      
    \`\`\`

    Please refer to the documentation for each tool and platform for full details and best practices.

    Lastly, execute 'terraform apply' to create your infrastructure.

    By using these tools, you can create reliable, scalable, and easily maintainable serverless applications.`,
    date: '2023-05-23',
    author: 'Usama Aslam',
    image: '../../assets/pictures/blog5.jpg', // Update the path as needed
}
];