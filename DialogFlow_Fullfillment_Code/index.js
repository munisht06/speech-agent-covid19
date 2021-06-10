// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const bent = require('bent');
const getJSON = bent('json');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name

  function worldwideLatestStats(agent) {
    const type = agent.parameters.type;
    return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/latest?source=jhu').then((result) => {

      agent.add('Based on the latest data, ');
      if (type.length >= 3) {
        agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19.`);
        return;
      }
      for (var i = 0; i < type.length; i++) {
        if (i === 1) {
          agent.add('In addition, ');
        }
        switch (type[i]) {
          case 'confirmed':
            agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19.`);
            break;
          case 'deaths':
            agent.add(`There are currently ${result.latest.deaths} deaths from COVID-19.`);
            break;
          case 'recovered':
            agent.add(`There are currently ${result.latest.recovered} people recovered from COVID-19.`);
            break;
          default:
            agent.add(`There are currently ${result.latest.confirmed} confirmed cases, ${result.latest.deaths} deaths, and ${result.latest.recovered} people who recovered from COVID-19.`);

        }
      }

    }).catch((error) => {
      console.error(error);
    });
  }
  function locationLatestStats(agent) {
    const type = agent.parameters.type;
    const state = agent.parameters.state;
    const city = agent.parameters.city;
    const county = agent.parameters.county;
    const country = agent.parameters.country;
    
    if(city.length > 0){
    	agent.add("Sorry, I don't have data for any city. You can ask questions about any country, state, or county.");
      	return;
    }
    if(state.length == 0 && county.length == 0 && country.length == 0){
    	agent.add("Sorry, I had trouble understanding your question. Could you please repeat your question again?");
      	return;
    }
    else{

    if (state.length <= 0) {

      return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=jhu').then((result) => {
        agent.add("Based on the latest data.");
        for (var p = 0; p < country.length; p++) {
			if(p == 1){
              agent.add("And ");
            }

          
          let d = [];
          let confirmed = 0;
          let death = 0;
          let recovered = 0;
          for (var i = 0; i < result.locations.length; i++) {
            if (result.locations[i].country_code == country[p]["alpha-2"]) {
              d = result.locations[i];
              confirmed = confirmed + d.latest.confirmed;
              death += d.latest.deaths;
              recovered += d.latest.recovered;


            }
          }
          agent.add(`In ${country[p].name}, `);
          for (var j = 0; j < type.length; j++) {
            if (j == 1) {
              agent.add("In addition, ");
            }
            switch (type[j]) {
              case 'confirmed':
                agent.add(`There are currently ${confirmed} confirmed cases of COVID-19.`);
                break;
              case 'deaths':
                agent.add(`There are currently ${death} deaths from COVID-19.`);
                break;
              case 'recovered':
                agent.add(`There are currently ${recovered} people recovered from COVID-19.`);
                break;
              default:
                agent.add(`There are currently ${confirmed} confirmed cases, ${death} deaths, and ${recovered} people who recovered from COVID-19.`);

            }
          }
        }

      }).catch((error) => {
        console.error(error);
      });

    }
    else {
      return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=csbs').then((result) => {

        if (county.length <= 0) {
          agent.add("Based on the latest data.");
          for (var i = 0; i < state.length; i++) {
            if(i == 1){
              agent.add("And ");
            }
            let d = [];
            let confirmed = 0;
            let deaths = 0;
            let recovered = 0;
            for (var p = 0; p < result.locations.length; p++) {
              if (result.locations[p].province == state[i]) {
                d = result.locations[p];
                confirmed = confirmed + d.latest.confirmed;
                deaths += d.latest.deaths;
                recovered += d.latest.recovered;
              }

            }
            
            agent.add(`In ${state[i]},`);
            for (var j = 0; j < type.length; j++) {
              if (j == 1) {
                agent.add("In addition, ");
              }
              switch (type[j]) {
                case 'confirmed':
                  agent.add(`There are currently ${confirmed} confirmed cases of COVID-19.`);
                  break;
                case 'deaths':
                  agent.add(`There are currently ${deaths} deaths from COVID-19.`);
                  break;
                case 'recovered':
                  agent.add(`There are currently ${recovered} people recovered from COVID-19.`);
                  break;
                default:
                  agent.add(`There are currently ${confirmed} confirmed cases, ${deaths} deaths, and ${recovered} people who recovered from COVID-19.`);

              }
            }


          }
        } else {
          agent.add("Based on the latest data.");
          for (var m = 0; m < county.length; m++) {
            if (m == 1) {
              agent.add("And ");
            }
            let d = [];
            let confirmed = 0;
            let deaths = 0;
            let recovered = 0;
            let temp = county[m].split(" ");
            for (var pm = 0; pm < result.locations.length; pm++) {
              if (result.locations[pm].province == state[0] && result.locations[pm].county == temp[0]) {
                d = result.locations[pm];
                confirmed += d.latest.confirmed;
                deaths += d.latest.deaths;
                recovered += d.latest.recovered;
              }
            }
            
           agent.add(`In ${county[m]}, ${state[0]},`);

            for (var jm = 0; jm < type.length; jm++) {
              if (jm == 1) {
                agent.add("Furthermore, ");
              }
              switch (type[jm]) {
                case 'confirmed':
                  agent.add(`There are currently ${confirmed} confirmed cases of COVID-19.`);
                  break;
                case 'deaths':
                  agent.add(`There are currently ${deaths} deaths from COVID-19.`);
                  break;
                case 'recovered':
                  agent.add(`There are currently ${recovered} people recovered from COVID-19.`);
                  break;
                default:
                  agent.add(`There are currently ${confirmed} confirmed cases, ${deaths} deaths, and ${recovered} people who recovered from COVID-19.`);

              }

            }
          }
        }
      }).catch(error => {
        console.error(error);
      });


    }




    }

  }
  let intentMap = new Map();

  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Worldwide Latest Stats', worldwideLatestStats);
  intentMap.set('Location Latest Stats', locationLatestStats);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
