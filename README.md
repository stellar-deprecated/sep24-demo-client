# Stellar SEP24 Demo Client

This demo implements the client side of a Stellar
[SEP24](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md)
interactive flow.  
It is automatically deploys from master to http://sep24.stellar.org/

## Build and run

Install Dependencies: `$ yarn`

Run Project: `$ yarn start`

## Usage

In order to use the demo client, you'll need to provide some details of your
implementation, most importantly the domain that hosts your TOML file, and the
currency you're trying to test. You'll also need to create an account to use
with the demo client which you can do at the
[Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
by generating a keypair, and funding it via friendbot.

Once your config is all set up you can start a deposit or withdraw flow by
pressing the button in the device frame, and step through the flow manually with
the button in the bottom left, or check the "Automatically perform background
actions" box in the config popup.

## Implementation Details

### Config

Since this is a project that should work with any partners API, there's often a
set of configurations they'll need to set up, including their home domain, the
asset they're trying to test, and some other optional things. This configuration
is described in
[`config.js`](https://github.com/stellar/sep24-demo-client/blob/master/src/config.js)
which allows us to add text fields to the config screen, as well as storing the
values in localStorage and in the URL hash for sharing.

### Steps

The actual implementation of the SEP24 protocol is done in a set of files in the
[steps](https://github.com/stellar/sep24-demo-client/tree/master/src/steps)
directory. Each small step is described in its own file to allow the client to
manually step through the process, as opposed to just running through it all at
once. The steps to be run are specified in
[`index.js`](https://github.com/stellar/sep24-demo-client/blob/master/src/index.js#L75-L100).

Each step has an `action` string, which gets displayed in the 'Next' button, as
well as an `execute` function, which actually executes the step. The `execute`
function receives the
[`state`](https://github.com/stellar/sep24-demo-client/blob/master/src/index.js#L7-L42)
object, which it can read from and write to to share data between steps, as well
as a set of UI Actions described below.

### UI Actions

UI Actions are a set of functions allowing each step to interact with the
interface of the demo client. This includes
[adding logs](https://github.com/stellar/sep24-demo-client/blob/master/src/ui/ui-actions.js#L94-L123)
of information to the log view, or
[updating the page that is visible in the device frame](https://github.com/stellar/sep24-demo-client/blob/master/src/ui/ui-actions.js#L165-L167).
A collection of UI Actions gets sent to each `step` to be used in their
execution.

### Pages

The UI inside the device is defined by a set of pages in the
[`pages`](https://github.com/stellar/sep24-demo-client/tree/master/pages)
directory. These are just static html files that can use functions defined in
[`wallet.js`](https://github.com/stellar/sep24-demo-client/blob/master/src/wallet.js).
Most of the interaction here is done by annotating buttons with the
[`[data-send-message]`](https://github.com/stellar/sep24-demo-client/blob/master/src/wallet.js#L3)
attribute, which will communicate with the overarching project via postMessage.
An example of this is at the beginning when deciding to go through the deposit
or withdraw flow, we will initially
[wait for a message](https://github.com/stellar/sep24-demo-client/blob/master/src/index.js#L108-L117)
from wallet.html, and when the user presses the
[deposit or withdraw button](https://github.com/stellar/sep24-demo-client/blob/master/pages/wallet.html#L38)
we get the message to continue with the specified flow.
