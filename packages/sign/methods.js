Meteor.methods({
	'Sign:getCentralPointOfReference': function getCentralPointOfReference(position){
		return SignsCollection.find({
			'location': {$near: { 
				$geometry : (new Location(position)).toMongo(),
                $maxDistance : 1000
            }}},{limit:1, sort:{when:1}, fields:{'location': 1}}).fetch().pop();
	},
	'Sign:getAll':function getAll(){
		return SignsCollection.find({}).fetch();
	}
})