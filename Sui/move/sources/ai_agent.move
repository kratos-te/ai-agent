module sui_ai_agent::ai_agent {
    use sui::event::{emit};
    use sui::transfer::{Self};
    use sui::coin::{Self, Coin};
    use sui::dynamic_field as df;
    use std::string::{Self, String};
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::dynamic_object_field as dof;
    use std::type_name::{Self, TypeName};
    use sui::tx_context::{Self, TxContext};
    use blob_store::blob::{Self, Blob};

    const ENameInvalid: u64 = 0;
    const EEncryptURLInvalid: u64 = 1;
    const EDescriptionInvalid: u64 = 2;
    const ECoinTypeInvalid: u64 = 3;
    const ECoinAmountInvalid: u64 = 4;
    const EAddressInvalid: u64 = 6;
    const EZEROBalance: u64 = 7;

    struct Container has key, store {
        id: UID
    }

    struct Agent<phantom CoinType> has key, store {
        id: UID,
        inner: ID,
        price: u64,
        name: String,
        encrypt_url: String,
        method_type: String,
        params: String,
        description: String,
        receive_address: address,
        type_name: TypeName,
        nonce: u64,
        balance: Balance<CoinType>
    }

    struct CreateAIAgentMessage has copy, drop {
        id: ID,
        price: u64,
        name: String,
        encrypt_url: String,
        method_type: String,
        params: String,
        description: String,
        receive_address: address,
        type_name: TypeName,
    }

    struct DeleteAIAgentMessage has copy, drop {
        id: ID,
    }

    struct CallAIMessage has copy, drop {
        id: ID,
        params: String,
        nonce: u64,
        caller: address,
        type_name: TypeName,
    }

    struct CallAIResult has copy, drop {
        id: ID,
        nonce: u64,
        blob_id_num: u256,
        blob_id_base64: String,
        caller: address,
    }

    struct UpdateNameMessage has copy, drop {
        id: ID,
        name: String,
        new_name: String,
    }

    struct UpdateEncryptUrlMessage has copy, drop {
        id: ID,
        encrypt_url: String,
        new_encrypt_url: String,
    }

    struct UpdateDescriptionMessage has copy, drop {
        id: ID,
        description: String,
        new_description: String,
    }

    struct UpdateReceiveAddressMessage has copy, drop {
        id: ID,
        receive_address: address,
        new_receive_address: address,
    }

    struct UpdatePriceMessage has copy, drop {
        id: ID,
        price: u64,
        new_price: u64
    }

    struct Item has store, copy, drop { id: ID }

    fun init(ctx: &mut TxContext) {
        let container = Container { id: object::new(ctx) };
        transfer::public_share_object(container);
    }

    public fun create_ai_agent<CoinType>(
        container: &mut Container,
        name: String,
        encrypt_url: String,
        method_type: String,
        params: String,
        description: String,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(string::length(&name) > 0, ENameInvalid);
        assert!(string::length(&encrypt_url) > 0, EEncryptURLInvalid);
        assert!(string::length(&description) > 0, EDescriptionInvalid);

        let receive_address= tx_context::sender(ctx);

        let uid = object::new(ctx);
        let id = object::uid_to_inner(&uid);
        let type_name = type_name::get<CoinType>();
        let agent = Agent<CoinType> {
            id: uid,
            inner: id,
            price,
            name,
            encrypt_url,
            method_type,
            params,
            description,
            receive_address,
            type_name,
            nonce: 0,
            balance: balance::zero()
        };

        dof::add(&mut container.id, Item { id }, agent);

        emit(CreateAIAgentMessage {
            id,
            price,
            name,
            encrypt_url,
            method_type,
            params,
            description,
            receive_address,
            type_name,
        })
    }

    public fun delete_ai_agent<CoinType>(
        container: &mut Container,
        agent_id: ID,
        ctx: &mut TxContext
    ) {
        let agent = dof::remove<Item, Agent<CoinType>>(&mut container.id, Item { id: agent_id });

        let Agent {
            id,
            inner,
            price : _,
            name : _,
            encrypt_url : _,
            method_type : _,
            params: _,
            description : _,
            receive_address,
            type_name: _,
            nonce: _,
            balance,
        } = agent;

        let addr = tx_context::sender(ctx);
        assert!(addr == receive_address, EAddressInvalid);

        let coin_amount = balance::value(&balance);
        if (coin_amount > 0) {
            let coin = coin::from_balance(balance, ctx);
            transfer::public_transfer(coin, receive_address);
        } else {
            balance::destroy_zero(balance);
        };

        object::delete(id);

        emit(DeleteAIAgentMessage {
            id: inner,
        })
    }

    public fun call_ai_agent<CoinType>(
        container: &mut Container,
        id: ID,
        params: String,
        coin: Coin<CoinType>,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let coin_type = type_name::get<CoinType>();
        assert!(coin_type == agent.type_name, ECoinTypeInvalid);

        let coin_amount = coin::value(&coin);
        assert!(coin_amount == agent.price, ECoinAmountInvalid);

        balance::join(&mut agent.balance, coin::into_balance(coin));

        agent.nonce = agent.nonce + 1;

        let type_name = type_name::get<CoinType>();
        emit(CallAIMessage {
            id: object::uid_to_inner(&agent.id),
            params,
            nonce: agent.nonce,
            caller: tx_context::sender(ctx),
            type_name
        });
    }

    public fun set_ai_agent_result_blob<CoinType>(
        container: &mut Container,
        id: ID,
        nonce: u64,
        caller: address,
        result: Blob,
        blob_id_base64: String,
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let blob_id_num = blob::blob_id(&result);
        df::add(&mut agent.id, nonce, result);

        emit(CallAIResult {
            id,
            nonce,
            blob_id_num,
            blob_id_base64,
            caller
        })
    }

    public fun claim<CoinType>(
        container: &mut Container,
        id: ID,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        let amount = balance::value(&agent.balance);

        assert!(amount > 0, EZEROBalance);

        if (amount > 0) {
            let claim_balance = balance::split(&mut agent.balance, amount);
            let coin = coin::from_balance(claim_balance, ctx);
            transfer::public_transfer(coin, agent.receive_address);
        }
    }

    public fun update_name<CoinType>(
        container: &mut Container,
        id: ID,
        name: String,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        assert!(string::length(&name) > 0, ENameInvalid);

        if (agent.name != name) {
            emit(UpdateNameMessage {
                id: object::uid_to_inner(&agent.id),
                name: agent.name,
                new_name: name,
            });
            agent.name = name;
        };
    }

    public fun update_encrypt_url<CoinType>(
        container: &mut Container,
        id: ID,
        encrypt_url: String,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        assert!(string::length(&encrypt_url) > 0, EEncryptURLInvalid);

        if (agent.encrypt_url != encrypt_url) {
            emit(UpdateEncryptUrlMessage {
                id: object::uid_to_inner(&agent.id),
                encrypt_url: agent.encrypt_url,
                new_encrypt_url: encrypt_url
            });
            agent.encrypt_url = encrypt_url;
        };
    }

    public fun update_description<CoinType>(
        container: &mut Container,
        id: ID,
        description: String,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        assert!(string::length(&description) > 0, EDescriptionInvalid);

        if (agent.description != description) {
            emit(UpdateDescriptionMessage {
                id: object::uid_to_inner(&agent.id),
                description: agent.description,
                new_description: description
            });
            agent.description = description;
        };
    }

    public fun update_price<CoinType>(
        container: &mut Container,
        id: ID,
        price: u64,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        if (agent.price != price) {
            emit(UpdatePriceMessage {
                id: object::uid_to_inner(&agent.id),
                price: agent.price,
                new_price: price
            });
            agent.price = price;
        }
    }

    public fun update_receive_address<CoinType>(
        container: &mut Container,
        id: ID,
        receive_address: address,
        ctx: &mut TxContext
    ) {
        let agent = dof::borrow_mut<Item, Agent<CoinType>>(&mut container.id, Item { id });

        let addr = tx_context::sender(ctx);
        assert!(addr == agent.receive_address, EAddressInvalid);

        if (agent.receive_address != receive_address) {
            emit(UpdateReceiveAddressMessage {
                id: object::uid_to_inner(&agent.id),
                receive_address: agent.receive_address,
                new_receive_address: receive_address
            });
            agent.receive_address = receive_address;
        };
    }
}
