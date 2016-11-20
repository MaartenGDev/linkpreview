class PocketApi {
    constructor(config, client) {
        this.config = config;
        this.client = client;
    }

    requestPermission() {
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/oauth/request',
                form: {consumer_key: this.config.consumer_key, redirect_uri: '/auth',},
                headers: {
                    'X-Accept': 'application/json'
                }
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const code = JSON.parse(body).code;
                        const authUrl = 'http://localhost:3000/auth';
                        this.code = code;

                        resolve({url: `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${authUrl}`, code: code});
                    }

                    reject();
                }
            );
        });


    }

    getAccessCode(){
        return this.code;
    }
    setAccessToken(token){
        this.accessToken = token;
    }

    getAccessToken(){
        return this.accessToken;
    }

    getPocketAccessToken(code) {
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/oauth/authorize',
                form: {
                    consumer_key: this.config.consumer_key,
                    code: code
                },
                headers: {
                    'X-Accept': 'application/json'
                }
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const {access_token, username} = JSON.parse(body);

                        this.setAccessToken(access_token);

                        resolve({username: username, accessCode: access_token});
                    }

                    reject();
                }
            );
        });
    }

    getItems(){
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/get',
                form: {
                    consumer_key: this.config.consumer_key,
                    access_token: this.getAccessToken(),
                    domain: 'https://dribbble.com'
                },
                headers: {
                    'X-Accept': 'application/json'
                }
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);

                        resolve(data);
                    }

                    reject();
                }
            );
        });
    }
}
module.exports = PocketApi;