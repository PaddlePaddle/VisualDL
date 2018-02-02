# Backend architecture design
Basically entire architecture consists of 3 layers, from top to bottom:

- Service Layer
  - Hosts a server with Flask
  - Provides APIs to frontend from backend
- Logic Layer
  - SDK in Python and C/C++: provides APIs to write logs for other applications and frameworks
  - Information Maintainer: responsible to periodically check when to write data into disk, and read data periodically into memory where server can have fast access from
- Storage Layer
  - Handles and structure log data format
  - Protobuf API: define protobuf interface for saving data

This is the architecture diagram:

<p align="center">
  <img src="./images/visualDL-backend-architecture.png"/>
</p>

Following is the basic breakdown:
## Service Layer
### Server
- Implement a server using a lightweight framework, provides two services:
  - Host a main application with support of a front end web app 
  - Provide a series of HTTP end points, using JSON for front end data communication
### Frontend API
- Frontend API acts as a standalone layer to have self contained front end API logic, server uses Frontend API to interact with front end

## Logic Layer
### Information Maintainer (IM)
IM provides specific data processing and computing, such as sampling and histogram computation.
In order to support some complicated and time consuming computational visualization methods like embedding, the computed results will be updated asynchronously.

IM & Server relationship

- IM will be updating data in memory asynchronously, such that server can directly have read access to
- IM should be providing API for server to read directly from memory

### SDK
- Python SDK can support all Python application
  - Frameworks such as Paddle, Caffe, Mxnet will be able to use Python SDK to support visualization easily
- C/C++ SDK can support integrating with other C/C++ ML framework
  - Frameworks such as Paddle can use C/C++ SDK to support visualization natively in framework layer

## Storage Layer
### Protobuf API
- Defines protobuf interface for storage, record, tablet, entry, etc and their relationship.
- Handles and process log data and serialization/deserialization when reading and writing to disk.




