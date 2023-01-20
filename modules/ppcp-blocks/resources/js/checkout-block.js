import {useEffect, useState} from '@wordpress/element';
import {registerExpressPaymentMethod} from '@woocommerce/blocks-registry';
import {PayPalScriptProvider, PayPalButtons} from "@paypal/react-paypal-js";
import {paypalOrderToWcShippingAddress, paypalPayerToWc} from "./Helper/Address";

const config = wc.wcSettings.getSetting('ppcp-gateway_data');
window.p = config;

const PayPalComponent = ({
                             onClick,
                             onClose,
                             onSubmit,
                             eventRegistration,
                             emitResponse,
                             setExpressPaymentError,
}) => {
    const {onPaymentProcessing} = eventRegistration;
    const {responseTypes} = emitResponse;

    const [paypalOrder, setPaypalOrder] = useState(null);

    const createOrder = async () => {
        try {
            const res = await fetch(config.scriptData.ajax.create_order.endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                body: JSON.stringify({
                    nonce: config.scriptData.ajax.create_order.nonce,
                    bn_code: '',
                    context: 'express',
                    order_id: config.scriptData.order_id,
                    payment_method: 'ppcp-gateway',
                    funding_source: 'paypal',
                    createaccount: false
                }),
            });

            const json = await res.json();

            if (!json.success) {
                if (json.data?.details?.length > 0) {
                    throw new Error(json.data.details.map(d => `${d.issue} ${d.description}`).join('<br/>'));
                } else if (json.data?.message) {
                    throw new Error(json.data.message);
                }

                throw new Error(config.scriptData.labels.error.generic);
            }
            return json.data.id;
        } catch (err) {
            console.error(err);

            setExpressPaymentError(err.message);

            onClose();

            throw err;
        }
    };

    const handleApprove = async (data, actions) => {
        try {
            const res = await fetch(config.scriptData.ajax.approve_order.endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                body: JSON.stringify({
                    nonce: config.scriptData.ajax.approve_order.nonce,
                    order_id: data.orderID,
                    //funding_source: ,
                })
            });

            const json = await res.json();

            if (!json.success) {
                if (typeof actions !== 'undefined' && typeof actions.restart !== 'undefined') {
                    return actions.restart();
                }
                if (json.data?.message) {
                    throw new Error(json.data.message);
                }

                throw new Error(config.scriptData.labels.error.generic)
            }

            setPaypalOrder(json.data);

            onSubmit();
        } catch (err) {
            console.error(err);

            setExpressPaymentError(err.message);

            onClose();

            throw err;
        }
    };

    const handleClick = () => {
        setExpressPaymentError('');

        onClick();
    };

    useEffect(() => {
        const unsubscribeProcessing = onPaymentProcessing(() => {
            const shippingAddress = paypalOrderToWcShippingAddress(paypalOrder);
            const billingAddress = paypalPayerToWc(paypalOrder.payer);

            return {
                type: responseTypes.SUCCESS,
                meta: {
                    paymentMethodData: {
                        'paypal_order_id': paypalOrder.id,
                    },
                    shippingData: {address: shippingAddress},
                    billingAddress,
                    billingData: billingAddress,
                },
            };
        });
        return () => {
            unsubscribeProcessing();
        };
    }, [onPaymentProcessing, paypalOrder]);

    return (
        <PayPalScriptProvider options={config.scriptData.url_params}>
            <PayPalButtons
                style={config.scriptData.button.style}
                onClick={handleClick}
                onCancel={onClose}
                onError={onClose}
                createOrder={createOrder}
                onApprove={handleApprove}
            />
        </PayPalScriptProvider>
    );
}

registerExpressPaymentMethod({
    name: config.id,
    label: <div dangerouslySetInnerHTML={{__html: config.title}}/>,
    content: <PayPalComponent/>,
    edit: <b>TODO: editing</b>,
    ariaLabel: config.title,
    canMakePayment: () => true,
    supports: {
        features: ['products'],
    },
});
