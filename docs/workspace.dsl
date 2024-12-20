workspace {
    model {
        sistema = softwareSystem "Sistema de Notificações" {
            snstopic = container "MESSAGE-TOPIC" {
                description "Tópico SNS usado para distribuir mensagens."
                technology "SNS Topic"
                tags "Amazon Web Services - Simple Notification Service Topic" "Topic" "Amazon Web Services - Simple Notification Service SNS Topic"
            }
            filaSQS = container "MESSAGE-QUEUE" {
                description "Fila que recebe mensagens filtradas do tópico SNS."
                technology "AWS SQS"
                tags "Queue" "Amazon Web Services - Simple Queue Service Queue" "Amazon Web Services - Simple Queue Service SQS Queue"
            }
            server = container "SERVER" {
                description "Servidor que encaminha mensagens"
                technology ".NET 8"
                tags "Amazon Web Services - Elastic Container Service Service"
            }
            server -> snstopic "Publica mensagens no tópico"
            snstopic -> filaSQS "Envia mensagens filtradas para"
        }

        live = deploymentEnvironment "Live" {
            deploymentNode "Amazon Web Services" {
                tags "Amazon Web Services - Cloud"

                deploymentNode "Enterprise"{
                    tags "Amazon Web Services - Server contents" #"Amazon Web Services - WorkMail"
                    
                    deploymentNode "sa-east-1" {
                        tags "Amazon Web Services - Region"

                        infrastructureNode "KMS Parameter" {
                            tags "Amazon Web Services - Key Management Service"
                        }

                        // deploymentNode "Amazon ECS" {
                        //     tags "Amazon Web Services - Elastic Container Service"
                        //     containerInstance server
                        // }

                        deploymentNode "Amazon SNS" {
                            tags "Amazon Web Services - Simple Notification Service SNS"
                            containerInstance snstopic
                        }

                        deploymentNode "Amazon SQS" {
                            tags "Amazon Web Services - Simple Queue Service SQS"
                            containerInstance filaSQS
                            infrastructureNode "MESSAGE-QUEUE-DLQ" {
                                tags "Queue" "Amazon Web Services - Simple Queue Service Queue" "Amazon Web Services - Simple Queue Service SQS Queue"
                            }
                        }

                        deploymentNode "CloudWatch" {
                            tags "Amazon Web Services - CloudWatch"
                            instances 5
                            infrastructureNode "Alarmes SQS Queue" {
                                tags "Amazon Web Services - CloudWatch Alarm"
                            }
                            infrastructureNode "Alarmes SNS Topic" {
                                tags "Amazon Web Services - CloudWatch Alarm"
                            }
                        }
                    }
                }
            }
        }
    }
    views {
        container sistema "sns-com-sqs" {
            include snstopic
            include filaSQS
            include server
            autoLayout
        }
        deployment * live "deploy-dev"{
            include *
            // autoLayout tb
        }

        theme https://static.structurizr.com/themes/amazon-web-services-2020.04.30/theme.json

        !include styles.dsl
    }
}