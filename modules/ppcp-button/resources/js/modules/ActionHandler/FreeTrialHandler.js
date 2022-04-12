import {PaymentMethods} from "../Helper/CheckoutMethodState";
import errorHandler from "../ErrorHandler";

class FreeTrialHandler {
    constructor(
        config,
        spinner,
        errorHandler
    ) {
        this.config = config;
        this.spinner = spinner;
        this.errorHandler = errorHandler;
    }

    handle()
    {
        this.spinner.block();

        fetch(this.config.ajax.vault_paypal.endpoint, {
            method: 'POST',
            body: JSON.stringify({
                nonce: this.config.ajax.vault_paypal.nonce,
                return_url: location.href
            }),
        }).then(res => {
            this.spinner.unblock()
            return res.json();
        }).then(data => {
            if (!data.success) {
                console.error(data);
                this.errorHandler.message(data.data.message);
                throw Error(data.data.message);
            }

            location.href = data.data.approve_link;
        });
    }
}
export default FreeTrialHandler;
