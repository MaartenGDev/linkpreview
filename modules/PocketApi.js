class PocketApi {
    constructor(config, client, dribbble) {
        this.config = config;
        this.client = client;
        this.dribbble = dribbble;
    }

    requestPermission() {
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/oauth/request',
                form: {consumer_key: this.config.pocket.consumer_key, redirect_uri: '/auth',},
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
                    }else{
                        reject();
                    }

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
                    consumer_key: this.config.pocket.consumer_key,
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
                    }else{
                        reject();
                    }

                }
            );
        });
    }

    getProjects(){
        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/get',
                form: {
                    consumer_key: this.config.pocket.consumer_key,
                    access_token: this.getAccessToken(),
                    count: 3
                },
                headers: {
                    'X-Accept': 'application/json'
                }
            };

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);

                        const items = Object.keys(data.list).map(key => {
                            return data.list[key];
                        }).map(item => {
                           return {name: item.resolved_title, image: ''};
                        });

                        console.log(items);

                        resolve(items);
                    }else{
                        reject();
                    }

                }
            );
        });
    }

    getItems(tag = null){
        let form = {
            consumer_key: this.config.pocket.consumer_key,
            access_token: this.getAccessToken(),
            domain: 'https://dribbble.com'
        };

        if(tag !== null){
            form.tag = tag;
        }

        return new Promise((resolve, reject) => {
            const options = {
                url: 'https://getpocket.com/v3/get',
                form: form,
                headers: {
                    'X-Accept': 'application/json'
                }
            };
            console.log("token: " + this.getAccessToken());

            this.client.post(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);

                        const items = Object.keys(data.list).map(key => {
                           return data.list[key];
                        }).map((item) => {
                            let imageId = item.resolved_url;

                            imageId = imageId.replace('http://dribbble.com/shots/', '');
                            imageId = imageId.replace('https://dribbble.com/shots/', '');
                            imageId = imageId.substr(0, imageId.indexOf('-'));

                            return this.dribbble.getDribbbleItem(imageId);
                        });

                        Promise.all(items).then((results) => {
                            resolve(results);
                        });
                    }else{
                        reject();
                    }

                }
            );
        });
    }
}
module.exports = PocketApi;