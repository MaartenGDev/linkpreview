class DribbbleApi {
    constructor(config, client) {
        this.config = config;
        this.client = client;
    }

    getRequestPermissionUrl() {
        const {client_id, state_secret} = this.config;

        return `https://dribbble.com/oauth/authorize?client_id=${client_id}&state=${state_secret}`;
    }
}
module.exports = DribbbleApi;