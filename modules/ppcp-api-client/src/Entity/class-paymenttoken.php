<?php
/**
 * The PaymentToken object.
 *
 * @package Inpsyde\PayPalCommerce\ApiClient\Entity
 */

declare(strict_types=1);

namespace Inpsyde\PayPalCommerce\ApiClient\Entity;

use Inpsyde\PayPalCommerce\ApiClient\Exception\RuntimeException;

/**
 * Class PaymentToken
 */
class PaymentToken {


	public const TYPE_PAYMENT_METHOD_TOKEN = 'PAYMENT_METHOD_TOKEN';
	public const VALID_TYPES               = array(
		self::TYPE_PAYMENT_METHOD_TOKEN,
	);

	/**
	 * The Id.
	 *
	 * @var string
	 */
	private $id;

	/**
	 * The type.
	 *
	 * @var string
	 */
	private $type;

	/**
	 * PaymentToken constructor.
	 *
	 * @param string $id The Id.
	 * @param string $type The type.
	 * @throws RuntimeException When the type is not valid.
	 */
	public function __construct( string $id, string $type = self::TYPE_PAYMENT_METHOD_TOKEN ) {
		if ( ! in_array( $type, self::VALID_TYPES, true ) ) {
			throw new RuntimeException(
				__( 'Not a valid payment source type.', 'paypal-payments-for-woocommerce' )
			);
		}
		$this->id   = $id;
		$this->type = $type;
	}

	/**
	 * Returns the ID.
	 *
	 * @return string
	 */
	public function id(): string {
		return $this->id;
	}

	/**
	 * Returns the type.
	 *
	 * @return string
	 */
	public function type(): string {
		return $this->type;
	}

	/**
	 * Returns the object as array.
	 *
	 * @return array
	 */
	public function to_array(): array {
		return array(
			'id'   => $this->id(),
			'type' => $this->type(),
		);
	}
}
