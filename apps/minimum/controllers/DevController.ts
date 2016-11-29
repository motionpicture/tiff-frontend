import {JsonController, Req, Get} from "routing-controllers";

@JsonController("/minimum/dev")
export class DevController {
    @Get("/environmentVariables")
    environmentVariables() {
        return {
            success: true,
            variables: process.env
        };
    }
}