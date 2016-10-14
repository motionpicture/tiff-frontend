cd ../
set NODE_ENV=dev02
node bin/command schema createCollections
node bin/command schema dropIndexes
node bin/command schema createIndexes

node bin/command film createTicketTypeGroupsFromJson
node bin/command film createFromJson
node bin/command theater createFromJson
node bin/command theater createScreensFromJson
node bin/command performance createFromJson
node bin/command reservation reset

node bin/command member createFromJson
node bin/command sponsor createFromJson
node bin/command staff createFromJson
node bin/command tel createFromJson
node bin/command window createFromJson

node bin/command member createReservationsFromJson
node bin/command staff createReservationsFromJson

pause