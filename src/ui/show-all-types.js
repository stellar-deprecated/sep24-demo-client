module.exports = function(uiActions) {
  uiActions.action(
    "This is an action taken by the user (addAction, .action)",
    "action",
  );
  uiActions.instruction(
    "This is an instruction giving the user more information about what is happening (addInstruction, .instruction)",
    "instruction",
  );
  uiActions.action(
    "Call /info endpoint to retrieve withdrawal information",
    "action",
  );
  uiActions.request("GET /info (addRequest, .outgoing.request)");
  uiActions.response("GET /info response (addResponse, .incoming.request)", {
    deposit: true,
    withdraw: true,
    fee: true,
    transactions: [{}, {}, {}],
    transaction: true,
  });
  uiActions.error(
    "This is an error to indicate something in the flow is broken.  We shouldn't be able to continue. (addError, .error) ",
  );
  uiActions.logObject(
    "Log an informational object (logObject(), .detail.informational",
    {
      address: "G320523905802935823098552395",
      txid: "T9320523095",
      name: "Michael",
    },
  );
};
