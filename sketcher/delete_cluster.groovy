pipeline {
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        labels:
          instance: jenkins-runner
        spec:
          containers:
          - name: jenkins-runner
            image: jenkins/slave:alpine
            command:
            - sleep
            args:
            - 99d
            resources:
              requests:
                memory: "16Mi"
                cpu: "250m"
              limits:
                memory: "64Mi"
                cpu: "500m"
      '''
    }
  }

  tools { go 'GoLang'}

  parameters {
    string(name: 'PULUMI_CLOUD_ORG', defaultValue: 'https://app.pulumi.com/nylespham', description: 'Pulumi Cloud Organization')
    string(name: 'CLUSTER_NAME', defaultValue: '', description: 'Name of the Kubernetes Cluster')
    choice(name: 'PROVIDER', choices: ["on-prem","digitalocean","aws"], description: 'Hosting Provider')
    string(name: 'REGION', description: 'Region of the application')
  }
  stages {
    stage('Install Pulumi') {
      steps {
        sh "curl -fsSL https://get.pulumi.com | sh"
        sh "$HOME/.pulumi/bin/pulumi version"
      }
    }
    stage('Configure Pulumi Cloud') {
      steps{
        withCredentials([string(credentialsId: 'PULUMI_ACCESS_TOKEN', variable: 'PULUMI_ACCESS_TOKEN')]){
          withEnv(["PATH+PULUMI=$HOME/.pulumi/bin"]){
            sh "pulumi login"
          }
        }
      }
    }
    stage('Remove Cluster') {
      steps {
        withEnv(["PATH+PULUMI=$HOME/.pulumi/bin"]){
          dir('docean') {
            sh "go mod download"
            sh "pulumi stack select $params.CLUSTER_NAME"
            sh "pulumi down --yes"
            sh "pulumi stack rm $params.CLUSTER_NAME --yes"
          }
        }
      }
    }
  }
}


