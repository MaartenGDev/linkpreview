class PocketApi {
    constructor(config, client) {
        this.config = config;
        this.client = client;
    }

    requestPermission() {
        let token = '';
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/oauth/request',
                form: {
                    consumer_key: this.config.consumer_key,
                    redirect_uri: '/auth',
                },
                headers: {
                    'X-Accept': 'application/json'
                }
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);
                        token = data.code;

                        const authUrl = 'http://localhost:3000/auth';

                        resolve(`https://getpocket.com/auth/authorize?request_token=${token}&redirect_uri=${authUrl}`);
                    }else{
                        reject();
                    }
                }
            );
        });


    }
}
module.exports = PocketApi;