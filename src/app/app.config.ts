import { ConfigService } from './services/config.service';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static printHost: string = "localhost";
    static apiURL: string = "http://localhost:7000/api/";
    static apiConnectionPassword: string;
    static printURL: string = "http://192.168.0.13:3030/api-pos-resto";
    static apiPort: number = 7000;
    static printPort: number = 7000;

    constructor() { }

    public static setApiHost(apiHost: string): void {
        this.apiHost = apiHost;
        Config.updateApiURL();
    }

    public static setPrintHost(printHost: string): void {
        this.printHost = printHost;
        Config.updatePrintURL();
    }

    public static setApiPort(apiPort: number): void {
        this.apiPort = apiPort;
        Config.updateApiURL();
    }

    public static setPrintPort(printPort: number): void {
        this.printPort = printPort;
        Config.updatePrintURL();
    }

    public static setApiConnectionPassword(apiConnectionPassword: string): void {
        this.apiConnectionPassword = apiConnectionPassword;
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }

    public static updatePrintURL() {
        if (Config.printPort !== 0) {
            Config.printURL = "http://" + Config.printHost + ":" + Config.printPort + "/api-pos-resto/";
        } else {
            Config.printURL = "http://" + Config.printHost + "/api-pos-resto/";
        }
    }
}