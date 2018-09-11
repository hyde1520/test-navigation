(function(){

    var tour = new Tour({
        name: "iftdss-tour",
        storage : window.localStorage,
    });

    tour.addSteps([
      {
        element: ".tour-step.tour-step-one",
        placement: "bottom",
        backdrop: true,
        title: "<h1>Welcome to IFTDSS!</h1>",
        content: "<p>We have worked hard to make IFTDSS a useful and intuitive tool however we realize that not everything within this initial release is perfect, there will likely be some bugs and quirks. The good news is that we're not done building! In fact, we're just getting started.</p><br><p>IFTDSS uses an Agile Development Process meaning we iterate quickly, making changes and improvements often. This puts YOU, the user, front and center and works best when you tell us what you need. Use the tools we've created to reach out and let us know what you think or give us ideas about how to improve and grow. Thanks for becoming an IFTDSS user, we look forward to building this tool with you and to being able to exceed your expectations!</p><br><p><strong>Reach out to us!</strong></p><ul><li>If you find a show stopping problem contact us through Technical Support and Submit a Ticket</li><li>Ask and answer questions to the IFTDSS Team and other users through the IFTDSS QA Forum</li><li>Have an Idea?  Submit an enhancement suggestion via the Ideas Exchange</li></ul><p>Most Importantly have fun and know the IFTDSS Team is listening. Now get out there and start your fuels planning adventure with us today!</p>"
      },
      {
        element: ".tour-step.tour-step-two",
        placement: "top",
        backdrop: true,
        title: "<h1>Please Note</h1>",
        content: "<h4><center>IFTDSS has not been tested for use with Internet Explorer</center></h4> <p><strong><em><center>We have only tested and approved the IFTDSS app for use in Google Chrome</center></strong></em></p><p>If you are using Internet Explorer the pages will not render correctly and the IFTDSS app will be very difficult to use. </p><br><p>Please note the instructions in this section. If you work for a DOI Bureau you should already have Chrome installed. </p><p>If you are a Forest Service employee you will need to request help installing Chrome from the Customer Help Desk. </p><p>Please do not attempt to install Chrome on your own!</p>"
      },

    ]);

    // Initialize the tour
    tour.init();

    // Start the tour
    tour.start();

}());
