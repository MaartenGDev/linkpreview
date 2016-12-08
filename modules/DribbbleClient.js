class DribbbleApi {
    constructor(config, client) {
        this.config = config;
        this.client = client;
    }

    getRequestPermissionUrl() {
        const {client_id, state_secret} = this.config.dribbble;

        return `https://dribbble.com/oauth/authorize?client_id=${client_id}&state=${state_secret}`;
    }

    createAccessToken(code) {
        return new Promise((resolve, reject) => {
            const {client_id, state_secret, client_secret} = this.config.dribbble;

            console.log(client_id, state_secret, code);

            const options = {
                url: `https://dribbble.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        this.accessToken = JSON.parse(body).access_token;

                        resolve({success: true});
                    }else{
                        reject();
                    }
                }
            );
        });
    }

    getDribbbleItem(id) {
        return new Promise((resolve, reject) => {
            const options = {
                url: `https://api.dribbble.com/v1/shots/${id}`,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            };

            this.client.get(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const shot = JSON.parse(body);

                        const image = shot.images.hidpi !== null ? shot.images.hidpi : shot.images.normal;

                        if(image == null){
                            console.log(shot);
                        }
                        resolve({title: shot.title, image: image});
                    }else{
                        console.log(`failed shot id for: ${id}. Status Code: ${response.statusCode}`);

                        reject();
                    }

                }
            );
        });
    }
}
module.exports = DribbbleApi;