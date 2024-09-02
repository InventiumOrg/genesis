pipeline {
  podTemplate(
    cloud: 'kubernetes',
    containers: [
      containerTemplate(
        name: 'jenkins-runner', 
        image: 'jenkins/slave:alpine', 
        command: 'sleep', 
        args: '99d',
        resourceRequestCpu: '50m',
        resourceLimitCpu: '100m',
        resourceRequestMemory: '100Mi',
        resourceLimitMemory: '200Mi',
      ),
      containerTemplate(
        name: 'jnlp',
        image: 'jekins/inbound-agent',
        resourceRequestCpu: '50m',
        resourceLimitCpu: '100m',
        resourceRequestMemory: '100Mi',
        resourceLimitMemory: '200Mi',
      ),
    ]
  )

  tools { go 'GoLang'}

  parameters {
    string(name: 'PULUMI_CLOUD_ORG', defaultValue: 'https://app.pulumi.com/nylespham', description: 'Pulumi Cloud Organization')
    string(name: 'CLUSTER_NAME', defaultValue: '', description: 'Name of the Kubernetes Cluster')
    string(name: 'TENANT_NAME', defaultValue: '', description: 'Name of the application')
    choice(name: 'EDITION', choices: ["sandbox","production"], description: 'Edition of the application')
    choice(name: 'VARIANT', choices: ["sandbox","business","enterprise"], description: 'Variant of the application')
    string(name: 'NUMBER_OF_NODES', description: 'Number of nodes in the cluster')
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
    stage('Create Cluster') {
      steps {
        withCredentials([string(credentialsId: 'DIGITAL_OCEAN_TOKEN', variable: 'DIGITALOCEAN_ACCESS_TOKEN')]){
          withEnv(["PATH+PULUMI=$HOME/.pulumi/bin"]){
            dir('docean') {
              sh "go mod download"
              sh "pulumi stack init $params.CLUSTER_NAME"
              sh "pulumi up --yes --skip-preview"
            }
          }
        }
      }
    }
  }
}


