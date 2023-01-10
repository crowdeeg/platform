const {userAccounts} = require("./dataInitialization/basicDemo");

// When a user is created, we check if it is the first "Created Account",
// ignoring the already added "tester" account
Accounts.onCreateUser((options, user) => {
    var role = {
        __global_roles__: ["admin"],
    };
    // Now that we are connected to the number of accounts we add in by default, 
    // we can just make sure that the admin is the first user made account
    if(Meteor.users.find().count() === Object.keys(userAccounts).length){
        user.roles = role;
    }
    // We must return the user or else the system fails
    return user;
  });
