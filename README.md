# Description:
The program allows user to look up latest stats about COVID-19 which includes confirmed cases, deaths, and number of recovered.The program can also allow user to ask about stats for certain countries, states, and counties. 
The program uses Dialogflow and coronavirus-tracker API to get the latest data for COVID-19 and Unity to provide user a UI. 
The character in this program has three animation: idle, acknowledgment, and talking. 
The idle animation is the default animantion, when user is talking the acknowledgment animation is triggered and when character responds back to the user the taking animation is triggered.
If the COVID-19 tracker API does not respond on time, the character will ask the user to repeat the question again.

# Tools to develop:
* Window 10
* Dialogflow
*  C#
*  Node.js/Javascript 
*  Unity 
*  Mixamo.

# Dependencies:
No dependencies needed for Unity. For dialogFlow bent was used for node.js.

# How to compile and run: 
To compile/to open, open Unity Hub and add "NUIAssignment3" folder as a project or open "NUIAssignment3" folder as a project. 
To build, in Unity click on file then "Build Setting" then click "Build" or "Build and Run" and then select the "Build" Folder in NUIA3. 
To run the project, copy the "nuispring2020.p12" file from the "Assets" folder and paste in the "NUIAssignment3_Data" folder in Build Folder then open the "NUIAssignment3.exe" file in the Build folder.
