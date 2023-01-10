// When a user is created, we check if it is the first "Created Account",
// ignoring the already added "tester" account
Accounts.onCreateUser((options, user) => {
    var role = {
        __global_roles__: ["admin"],
    };
    // NOTE: If we remove the "tester" account that is added in the startup, 
    // then the 1 would have to change to a 0 (given that currently the 1 tester account exists in Mongo)
    if(Meteor.users.find().count() === 1){
        user.roles = role;
    }
    // We must return the user or else the system fails
    return user;
  });
