[**中文**](./README_CN.md)

# Use VisualDL as fastdeploy client for request visualization

### Introduction

The FastDeploy Client component is mainly used to quickly access the fastdeployserver service based on [FastDeploy project](https://github.com/PaddlePaddle/FastDeploy), to help users visualize prediction requests and results, and make quick verification of deployed services. This component is developed based on the gradio.
  <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211204267-8e044f32-1008-46a7-828a-d7c27ac5754a.gif" width="100%"/>
   </p>

### Usage

use command

```shell
visualdl --host 0.0.0.0 --port 8080
```
Then open `http://127.0.0.1:8080` in the browser (please replace it with the ip of the machine that starts visualdl if not localhost), you can see the component tab of FastDeploy Client.

### Function Description

The client component is mainly divided into four parts. The first part is the parameter setting area of the fastdeployserver service, including the ip and port number of the http service, the port number of the metrics service, the model name and version number of the http inference service to be requested. The second part is the input and output area of the model, which helps users visualize prediction requests and results. The third part is the metrics area of the service, which is used to display the current performance metrics of the service. The fourth part is used to display the execution status of each operation.

  <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211206389-9932d606-ea71-4f05-87eb-dcc21c5eeec9.png" width="100%"/>
   </p>

- Parameter setting area of fastdeployserver service
  
   Set the ip address and port information of the server to be requested, as well as the model name and version number to perform inference. Subsequent requests will be sent to the set address.


- Input and output areas of the model

   Currently, there are two ways to access the service. The first one is "component form". This method will directly obtain the input and output of the model deployed on the server, and represent input and output variables by the components of Gradio. Each input and output variable is equipped with a text component and an image component. The user selects the corresponding component to use according to the actual type of the variable. For example, if the variable is image data, use the image component to input it, and if it is text, use the text component to input it. The returned data is also visualized through components. Since the visualization operations of different tasks are different, the task type selection is provided above. When the task type is not specified, the output variable is only displayed with the text component, displaying the original data returned by the server. When the task type is specified, the returned data will be parsed and displayed visually using the image component.
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211207902-4717011d-8ae2-4105-9508-ab164896f177.gif" width="100%"/>
   </p>
  

   The second is "original form", which is equivalent to an original http client, where the payload of the http request is input in the input text box, and the original payload returned by the server is displayed in the output text box. Using this approach, the construct format of the input and output is completely opaque to the user, so it is not recommended unless neccessary.
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211208731-381222bb-8fbe-45fa-bf78-4a3e2c7f6f04.gif" width="100%"/>
   </p>

  
- Service metrics area

   It is used to display the performance information returned by the fastdeployserver metrics service, including the execution statistics for  each request, response delay, and the utilization rate of computing devices in the environment.
  
   <p align="center">
   <img src="https://user-images.githubusercontent.com/22424850/211208071-e772ed55-9a3d-4a21-9bca-3d80f444ca64.gif" width="100%"/>
   </p>
- Execution status display area

   Displays the status of all operations performed on the client component. When the user clicks the "get model input and output", "submit request" and "update metrics" buttons, if an exception occurs, the execution status display area will show the exception messages. And if the execution is successful, there will be a corresponding tips so that the user can know the execution successes.