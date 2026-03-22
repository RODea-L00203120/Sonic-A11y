# A11y - An Audible Observibility Tool
A sound-based ambient monitoring tool for non-visual modality based monitoring of VM CPU load, RAM Usage and continuous error logging.  

This repository was created in order to develop, maintain and host documentation pertaining an academic research project undertaken by a student(L00203120) of the Disruptive DevOps module at The Atlantic Technological University. 


## Project Description 

- Visual Modality 
- Alternative - multi-talking, visually impaired, non-critical contextual awareness
- Notifying when engaged elsewhere
- DevOps role often invlove multiple threads/tasks and a background method of notification may be of benefit
- Developed with considerations for cognitive load and those with potential visual impairments in mind, however further studies would be required to refine for such purposes. 

## Technology Employed

- Graphana/Prometheus based

## How to clone, run locally and deploy

- Include links here

## Demonstration

- Images/Link to recording
- Link to Paper

### Sample Application for Demonstration Purposes

The [AlgoBench](sample-app/) application is included as a sample workload to generate real metrics for the A11y sonification plugin. It is a Java/Spring Boot algorithm benchmarking tool that compares sorting algorithms across different input sizes and data distributions.

**Tech Stack:** Java 21, Spring Boot 3, Gradle, Docker, Prometheus, Grafana

**Role in A11y:** AlgoBench exposes JVM and application metrics via Spring Boot Actuator and a Prometheus endpoint. These metrics (CPU load, memory usage, request rates) serve as the live data source that the A11y plugin will sonify. The application will be deployed on Azure to provide a persistent, accessible demonstration environment.

## To-Do

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Conclusion










