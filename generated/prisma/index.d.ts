
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model CardDeck
 * 
 */
export type CardDeck = $Result.DefaultSelection<Prisma.$CardDeckPayload>
/**
 * Model Deck
 * 
 */
export type Deck = $Result.DefaultSelection<Prisma.$DeckPayload>
/**
 * Model Card
 * 
 */
export type Card = $Result.DefaultSelection<Prisma.$CardPayload>
/**
 * Model ReviewLog
 * 
 */
export type ReviewLog = $Result.DefaultSelection<Prisma.$ReviewLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CardState: {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  REVIEW: 'REVIEW',
  RELEARNING: 'RELEARNING'
};

export type CardState = (typeof CardState)[keyof typeof CardState]

}

export type CardState = $Enums.CardState

export const CardState: typeof $Enums.CardState

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cardDeck`: Exposes CRUD operations for the **CardDeck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CardDecks
    * const cardDecks = await prisma.cardDeck.findMany()
    * ```
    */
  get cardDeck(): Prisma.CardDeckDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.deck`: Exposes CRUD operations for the **Deck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Decks
    * const decks = await prisma.deck.findMany()
    * ```
    */
  get deck(): Prisma.DeckDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.card`: Exposes CRUD operations for the **Card** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cards
    * const cards = await prisma.card.findMany()
    * ```
    */
  get card(): Prisma.CardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reviewLog`: Exposes CRUD operations for the **ReviewLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReviewLogs
    * const reviewLogs = await prisma.reviewLog.findMany()
    * ```
    */
  get reviewLog(): Prisma.ReviewLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    CardDeck: 'CardDeck',
    Deck: 'Deck',
    Card: 'Card',
    ReviewLog: 'ReviewLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "cardDeck" | "deck" | "card" | "reviewLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      CardDeck: {
        payload: Prisma.$CardDeckPayload<ExtArgs>
        fields: Prisma.CardDeckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CardDeckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CardDeckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          findFirst: {
            args: Prisma.CardDeckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CardDeckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          findMany: {
            args: Prisma.CardDeckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>[]
          }
          create: {
            args: Prisma.CardDeckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          createMany: {
            args: Prisma.CardDeckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CardDeckCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>[]
          }
          delete: {
            args: Prisma.CardDeckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          update: {
            args: Prisma.CardDeckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          deleteMany: {
            args: Prisma.CardDeckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CardDeckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CardDeckUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>[]
          }
          upsert: {
            args: Prisma.CardDeckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardDeckPayload>
          }
          aggregate: {
            args: Prisma.CardDeckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCardDeck>
          }
          groupBy: {
            args: Prisma.CardDeckGroupByArgs<ExtArgs>
            result: $Utils.Optional<CardDeckGroupByOutputType>[]
          }
          count: {
            args: Prisma.CardDeckCountArgs<ExtArgs>
            result: $Utils.Optional<CardDeckCountAggregateOutputType> | number
          }
        }
      }
      Deck: {
        payload: Prisma.$DeckPayload<ExtArgs>
        fields: Prisma.DeckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          findFirst: {
            args: Prisma.DeckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          findMany: {
            args: Prisma.DeckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>[]
          }
          create: {
            args: Prisma.DeckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          createMany: {
            args: Prisma.DeckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeckCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>[]
          }
          delete: {
            args: Prisma.DeckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          update: {
            args: Prisma.DeckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          deleteMany: {
            args: Prisma.DeckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeckUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>[]
          }
          upsert: {
            args: Prisma.DeckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeckPayload>
          }
          aggregate: {
            args: Prisma.DeckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeck>
          }
          groupBy: {
            args: Prisma.DeckGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeckGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeckCountArgs<ExtArgs>
            result: $Utils.Optional<DeckCountAggregateOutputType> | number
          }
        }
      }
      Card: {
        payload: Prisma.$CardPayload<ExtArgs>
        fields: Prisma.CardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findFirst: {
            args: Prisma.CardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findMany: {
            args: Prisma.CardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          create: {
            args: Prisma.CardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          createMany: {
            args: Prisma.CardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          delete: {
            args: Prisma.CardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          update: {
            args: Prisma.CardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          deleteMany: {
            args: Prisma.CardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          upsert: {
            args: Prisma.CardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          aggregate: {
            args: Prisma.CardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCard>
          }
          groupBy: {
            args: Prisma.CardGroupByArgs<ExtArgs>
            result: $Utils.Optional<CardGroupByOutputType>[]
          }
          count: {
            args: Prisma.CardCountArgs<ExtArgs>
            result: $Utils.Optional<CardCountAggregateOutputType> | number
          }
        }
      }
      ReviewLog: {
        payload: Prisma.$ReviewLogPayload<ExtArgs>
        fields: Prisma.ReviewLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          findFirst: {
            args: Prisma.ReviewLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          findMany: {
            args: Prisma.ReviewLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          create: {
            args: Prisma.ReviewLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          createMany: {
            args: Prisma.ReviewLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          delete: {
            args: Prisma.ReviewLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          update: {
            args: Prisma.ReviewLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          deleteMany: {
            args: Prisma.ReviewLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReviewLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          upsert: {
            args: Prisma.ReviewLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          aggregate: {
            args: Prisma.ReviewLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReviewLog>
          }
          groupBy: {
            args: Prisma.ReviewLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewLogCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    cardDeck?: CardDeckOmit
    deck?: DeckOmit
    card?: CardOmit
    reviewLog?: ReviewLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    decks: number
    cards: number
    logs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decks?: boolean | UserCountOutputTypeCountDecksArgs
    cards?: boolean | UserCountOutputTypeCountCardsArgs
    logs?: boolean | UserCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeckWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
  }


  /**
   * Count Type DeckCountOutputType
   */

  export type DeckCountOutputType = {
    cardDecks: number
  }

  export type DeckCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cardDecks?: boolean | DeckCountOutputTypeCountCardDecksArgs
  }

  // Custom InputTypes
  /**
   * DeckCountOutputType without action
   */
  export type DeckCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeckCountOutputType
     */
    select?: DeckCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DeckCountOutputType without action
   */
  export type DeckCountOutputTypeCountCardDecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardDeckWhereInput
  }


  /**
   * Count Type CardCountOutputType
   */

  export type CardCountOutputType = {
    cardDecks: number
    logs: number
  }

  export type CardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cardDecks?: boolean | CardCountOutputTypeCountCardDecksArgs
    logs?: boolean | CardCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardCountOutputType
     */
    select?: CardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeCountCardDecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardDeckWhereInput
  }

  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    password: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    decks?: boolean | User$decksArgs<ExtArgs>
    cards?: boolean | User$cardsArgs<ExtArgs>
    logs?: boolean | User$logsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decks?: boolean | User$decksArgs<ExtArgs>
    cards?: boolean | User$cardsArgs<ExtArgs>
    logs?: boolean | User$logsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      decks: Prisma.$DeckPayload<ExtArgs>[]
      cards: Prisma.$CardPayload<ExtArgs>[]
      logs: Prisma.$ReviewLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      password: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    decks<T extends User$decksArgs<ExtArgs> = {}>(args?: Subset<T, User$decksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cards<T extends User$cardsArgs<ExtArgs> = {}>(args?: Subset<T, User$cardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    logs<T extends User$logsArgs<ExtArgs> = {}>(args?: Subset<T, User$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.decks
   */
  export type User$decksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    where?: DeckWhereInput
    orderBy?: DeckOrderByWithRelationInput | DeckOrderByWithRelationInput[]
    cursor?: DeckWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DeckScalarFieldEnum | DeckScalarFieldEnum[]
  }

  /**
   * User.cards
   */
  export type User$cardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    where?: CardWhereInput
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    cursor?: CardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * User.logs
   */
  export type User$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    cursor?: ReviewLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model CardDeck
   */

  export type AggregateCardDeck = {
    _count: CardDeckCountAggregateOutputType | null
    _min: CardDeckMinAggregateOutputType | null
    _max: CardDeckMaxAggregateOutputType | null
  }

  export type CardDeckMinAggregateOutputType = {
    cardId: string | null
    deckId: string | null
  }

  export type CardDeckMaxAggregateOutputType = {
    cardId: string | null
    deckId: string | null
  }

  export type CardDeckCountAggregateOutputType = {
    cardId: number
    deckId: number
    _all: number
  }


  export type CardDeckMinAggregateInputType = {
    cardId?: true
    deckId?: true
  }

  export type CardDeckMaxAggregateInputType = {
    cardId?: true
    deckId?: true
  }

  export type CardDeckCountAggregateInputType = {
    cardId?: true
    deckId?: true
    _all?: true
  }

  export type CardDeckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CardDeck to aggregate.
     */
    where?: CardDeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CardDecks to fetch.
     */
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CardDeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CardDecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CardDecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CardDecks
    **/
    _count?: true | CardDeckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CardDeckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CardDeckMaxAggregateInputType
  }

  export type GetCardDeckAggregateType<T extends CardDeckAggregateArgs> = {
        [P in keyof T & keyof AggregateCardDeck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCardDeck[P]>
      : GetScalarType<T[P], AggregateCardDeck[P]>
  }




  export type CardDeckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardDeckWhereInput
    orderBy?: CardDeckOrderByWithAggregationInput | CardDeckOrderByWithAggregationInput[]
    by: CardDeckScalarFieldEnum[] | CardDeckScalarFieldEnum
    having?: CardDeckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CardDeckCountAggregateInputType | true
    _min?: CardDeckMinAggregateInputType
    _max?: CardDeckMaxAggregateInputType
  }

  export type CardDeckGroupByOutputType = {
    cardId: string
    deckId: string
    _count: CardDeckCountAggregateOutputType | null
    _min: CardDeckMinAggregateOutputType | null
    _max: CardDeckMaxAggregateOutputType | null
  }

  type GetCardDeckGroupByPayload<T extends CardDeckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CardDeckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CardDeckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CardDeckGroupByOutputType[P]>
            : GetScalarType<T[P], CardDeckGroupByOutputType[P]>
        }
      >
    >


  export type CardDeckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cardId?: boolean
    deckId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cardDeck"]>

  export type CardDeckSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cardId?: boolean
    deckId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cardDeck"]>

  export type CardDeckSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cardId?: boolean
    deckId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cardDeck"]>

  export type CardDeckSelectScalar = {
    cardId?: boolean
    deckId?: boolean
  }

  export type CardDeckOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"cardId" | "deckId", ExtArgs["result"]["cardDeck"]>
  export type CardDeckInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }
  export type CardDeckIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }
  export type CardDeckIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    deck?: boolean | DeckDefaultArgs<ExtArgs>
  }

  export type $CardDeckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CardDeck"
    objects: {
      card: Prisma.$CardPayload<ExtArgs>
      deck: Prisma.$DeckPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      cardId: string
      deckId: string
    }, ExtArgs["result"]["cardDeck"]>
    composites: {}
  }

  type CardDeckGetPayload<S extends boolean | null | undefined | CardDeckDefaultArgs> = $Result.GetResult<Prisma.$CardDeckPayload, S>

  type CardDeckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CardDeckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CardDeckCountAggregateInputType | true
    }

  export interface CardDeckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CardDeck'], meta: { name: 'CardDeck' } }
    /**
     * Find zero or one CardDeck that matches the filter.
     * @param {CardDeckFindUniqueArgs} args - Arguments to find a CardDeck
     * @example
     * // Get one CardDeck
     * const cardDeck = await prisma.cardDeck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CardDeckFindUniqueArgs>(args: SelectSubset<T, CardDeckFindUniqueArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CardDeck that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CardDeckFindUniqueOrThrowArgs} args - Arguments to find a CardDeck
     * @example
     * // Get one CardDeck
     * const cardDeck = await prisma.cardDeck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CardDeckFindUniqueOrThrowArgs>(args: SelectSubset<T, CardDeckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CardDeck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckFindFirstArgs} args - Arguments to find a CardDeck
     * @example
     * // Get one CardDeck
     * const cardDeck = await prisma.cardDeck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CardDeckFindFirstArgs>(args?: SelectSubset<T, CardDeckFindFirstArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CardDeck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckFindFirstOrThrowArgs} args - Arguments to find a CardDeck
     * @example
     * // Get one CardDeck
     * const cardDeck = await prisma.cardDeck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CardDeckFindFirstOrThrowArgs>(args?: SelectSubset<T, CardDeckFindFirstOrThrowArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CardDecks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CardDecks
     * const cardDecks = await prisma.cardDeck.findMany()
     * 
     * // Get first 10 CardDecks
     * const cardDecks = await prisma.cardDeck.findMany({ take: 10 })
     * 
     * // Only select the `cardId`
     * const cardDeckWithCardIdOnly = await prisma.cardDeck.findMany({ select: { cardId: true } })
     * 
     */
    findMany<T extends CardDeckFindManyArgs>(args?: SelectSubset<T, CardDeckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CardDeck.
     * @param {CardDeckCreateArgs} args - Arguments to create a CardDeck.
     * @example
     * // Create one CardDeck
     * const CardDeck = await prisma.cardDeck.create({
     *   data: {
     *     // ... data to create a CardDeck
     *   }
     * })
     * 
     */
    create<T extends CardDeckCreateArgs>(args: SelectSubset<T, CardDeckCreateArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CardDecks.
     * @param {CardDeckCreateManyArgs} args - Arguments to create many CardDecks.
     * @example
     * // Create many CardDecks
     * const cardDeck = await prisma.cardDeck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CardDeckCreateManyArgs>(args?: SelectSubset<T, CardDeckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CardDecks and returns the data saved in the database.
     * @param {CardDeckCreateManyAndReturnArgs} args - Arguments to create many CardDecks.
     * @example
     * // Create many CardDecks
     * const cardDeck = await prisma.cardDeck.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CardDecks and only return the `cardId`
     * const cardDeckWithCardIdOnly = await prisma.cardDeck.createManyAndReturn({
     *   select: { cardId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CardDeckCreateManyAndReturnArgs>(args?: SelectSubset<T, CardDeckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CardDeck.
     * @param {CardDeckDeleteArgs} args - Arguments to delete one CardDeck.
     * @example
     * // Delete one CardDeck
     * const CardDeck = await prisma.cardDeck.delete({
     *   where: {
     *     // ... filter to delete one CardDeck
     *   }
     * })
     * 
     */
    delete<T extends CardDeckDeleteArgs>(args: SelectSubset<T, CardDeckDeleteArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CardDeck.
     * @param {CardDeckUpdateArgs} args - Arguments to update one CardDeck.
     * @example
     * // Update one CardDeck
     * const cardDeck = await prisma.cardDeck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CardDeckUpdateArgs>(args: SelectSubset<T, CardDeckUpdateArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CardDecks.
     * @param {CardDeckDeleteManyArgs} args - Arguments to filter CardDecks to delete.
     * @example
     * // Delete a few CardDecks
     * const { count } = await prisma.cardDeck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CardDeckDeleteManyArgs>(args?: SelectSubset<T, CardDeckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CardDecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CardDecks
     * const cardDeck = await prisma.cardDeck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CardDeckUpdateManyArgs>(args: SelectSubset<T, CardDeckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CardDecks and returns the data updated in the database.
     * @param {CardDeckUpdateManyAndReturnArgs} args - Arguments to update many CardDecks.
     * @example
     * // Update many CardDecks
     * const cardDeck = await prisma.cardDeck.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CardDecks and only return the `cardId`
     * const cardDeckWithCardIdOnly = await prisma.cardDeck.updateManyAndReturn({
     *   select: { cardId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CardDeckUpdateManyAndReturnArgs>(args: SelectSubset<T, CardDeckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CardDeck.
     * @param {CardDeckUpsertArgs} args - Arguments to update or create a CardDeck.
     * @example
     * // Update or create a CardDeck
     * const cardDeck = await prisma.cardDeck.upsert({
     *   create: {
     *     // ... data to create a CardDeck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CardDeck we want to update
     *   }
     * })
     */
    upsert<T extends CardDeckUpsertArgs>(args: SelectSubset<T, CardDeckUpsertArgs<ExtArgs>>): Prisma__CardDeckClient<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CardDecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckCountArgs} args - Arguments to filter CardDecks to count.
     * @example
     * // Count the number of CardDecks
     * const count = await prisma.cardDeck.count({
     *   where: {
     *     // ... the filter for the CardDecks we want to count
     *   }
     * })
    **/
    count<T extends CardDeckCountArgs>(
      args?: Subset<T, CardDeckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CardDeckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CardDeck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CardDeckAggregateArgs>(args: Subset<T, CardDeckAggregateArgs>): Prisma.PrismaPromise<GetCardDeckAggregateType<T>>

    /**
     * Group by CardDeck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardDeckGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CardDeckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CardDeckGroupByArgs['orderBy'] }
        : { orderBy?: CardDeckGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CardDeckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCardDeckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CardDeck model
   */
  readonly fields: CardDeckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CardDeck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CardDeckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    card<T extends CardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CardDefaultArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    deck<T extends DeckDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DeckDefaultArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CardDeck model
   */
  interface CardDeckFieldRefs {
    readonly cardId: FieldRef<"CardDeck", 'String'>
    readonly deckId: FieldRef<"CardDeck", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CardDeck findUnique
   */
  export type CardDeckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter, which CardDeck to fetch.
     */
    where: CardDeckWhereUniqueInput
  }

  /**
   * CardDeck findUniqueOrThrow
   */
  export type CardDeckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter, which CardDeck to fetch.
     */
    where: CardDeckWhereUniqueInput
  }

  /**
   * CardDeck findFirst
   */
  export type CardDeckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter, which CardDeck to fetch.
     */
    where?: CardDeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CardDecks to fetch.
     */
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CardDecks.
     */
    cursor?: CardDeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CardDecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CardDecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CardDecks.
     */
    distinct?: CardDeckScalarFieldEnum | CardDeckScalarFieldEnum[]
  }

  /**
   * CardDeck findFirstOrThrow
   */
  export type CardDeckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter, which CardDeck to fetch.
     */
    where?: CardDeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CardDecks to fetch.
     */
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CardDecks.
     */
    cursor?: CardDeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CardDecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CardDecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CardDecks.
     */
    distinct?: CardDeckScalarFieldEnum | CardDeckScalarFieldEnum[]
  }

  /**
   * CardDeck findMany
   */
  export type CardDeckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter, which CardDecks to fetch.
     */
    where?: CardDeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CardDecks to fetch.
     */
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CardDecks.
     */
    cursor?: CardDeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CardDecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CardDecks.
     */
    skip?: number
    distinct?: CardDeckScalarFieldEnum | CardDeckScalarFieldEnum[]
  }

  /**
   * CardDeck create
   */
  export type CardDeckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * The data needed to create a CardDeck.
     */
    data: XOR<CardDeckCreateInput, CardDeckUncheckedCreateInput>
  }

  /**
   * CardDeck createMany
   */
  export type CardDeckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CardDecks.
     */
    data: CardDeckCreateManyInput | CardDeckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CardDeck createManyAndReturn
   */
  export type CardDeckCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * The data used to create many CardDecks.
     */
    data: CardDeckCreateManyInput | CardDeckCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CardDeck update
   */
  export type CardDeckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * The data needed to update a CardDeck.
     */
    data: XOR<CardDeckUpdateInput, CardDeckUncheckedUpdateInput>
    /**
     * Choose, which CardDeck to update.
     */
    where: CardDeckWhereUniqueInput
  }

  /**
   * CardDeck updateMany
   */
  export type CardDeckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CardDecks.
     */
    data: XOR<CardDeckUpdateManyMutationInput, CardDeckUncheckedUpdateManyInput>
    /**
     * Filter which CardDecks to update
     */
    where?: CardDeckWhereInput
    /**
     * Limit how many CardDecks to update.
     */
    limit?: number
  }

  /**
   * CardDeck updateManyAndReturn
   */
  export type CardDeckUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * The data used to update CardDecks.
     */
    data: XOR<CardDeckUpdateManyMutationInput, CardDeckUncheckedUpdateManyInput>
    /**
     * Filter which CardDecks to update
     */
    where?: CardDeckWhereInput
    /**
     * Limit how many CardDecks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CardDeck upsert
   */
  export type CardDeckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * The filter to search for the CardDeck to update in case it exists.
     */
    where: CardDeckWhereUniqueInput
    /**
     * In case the CardDeck found by the `where` argument doesn't exist, create a new CardDeck with this data.
     */
    create: XOR<CardDeckCreateInput, CardDeckUncheckedCreateInput>
    /**
     * In case the CardDeck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CardDeckUpdateInput, CardDeckUncheckedUpdateInput>
  }

  /**
   * CardDeck delete
   */
  export type CardDeckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    /**
     * Filter which CardDeck to delete.
     */
    where: CardDeckWhereUniqueInput
  }

  /**
   * CardDeck deleteMany
   */
  export type CardDeckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CardDecks to delete
     */
    where?: CardDeckWhereInput
    /**
     * Limit how many CardDecks to delete.
     */
    limit?: number
  }

  /**
   * CardDeck without action
   */
  export type CardDeckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
  }


  /**
   * Model Deck
   */

  export type AggregateDeck = {
    _count: DeckCountAggregateOutputType | null
    _min: DeckMinAggregateOutputType | null
    _max: DeckMaxAggregateOutputType | null
  }

  export type DeckMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    color: string | null
    isPublic: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type DeckMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    color: string | null
    isPublic: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type DeckCountAggregateOutputType = {
    id: number
    title: number
    description: number
    color: number
    isPublic: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type DeckMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    color?: true
    isPublic?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type DeckMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    color?: true
    isPublic?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type DeckCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    color?: true
    isPublic?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type DeckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Deck to aggregate.
     */
    where?: DeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Decks to fetch.
     */
    orderBy?: DeckOrderByWithRelationInput | DeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Decks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Decks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Decks
    **/
    _count?: true | DeckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeckMaxAggregateInputType
  }

  export type GetDeckAggregateType<T extends DeckAggregateArgs> = {
        [P in keyof T & keyof AggregateDeck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeck[P]>
      : GetScalarType<T[P], AggregateDeck[P]>
  }




  export type DeckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeckWhereInput
    orderBy?: DeckOrderByWithAggregationInput | DeckOrderByWithAggregationInput[]
    by: DeckScalarFieldEnum[] | DeckScalarFieldEnum
    having?: DeckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeckCountAggregateInputType | true
    _min?: DeckMinAggregateInputType
    _max?: DeckMaxAggregateInputType
  }

  export type DeckGroupByOutputType = {
    id: string
    title: string
    description: string | null
    color: string | null
    isPublic: boolean
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: DeckCountAggregateOutputType | null
    _min: DeckMinAggregateOutputType | null
    _max: DeckMaxAggregateOutputType | null
  }

  type GetDeckGroupByPayload<T extends DeckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeckGroupByOutputType[P]>
            : GetScalarType<T[P], DeckGroupByOutputType[P]>
        }
      >
    >


  export type DeckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    color?: boolean
    isPublic?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    cardDecks?: boolean | Deck$cardDecksArgs<ExtArgs>
    _count?: boolean | DeckCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deck"]>

  export type DeckSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    color?: boolean
    isPublic?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deck"]>

  export type DeckSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    color?: boolean
    isPublic?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deck"]>

  export type DeckSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    color?: boolean
    isPublic?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type DeckOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "color" | "isPublic" | "deletedAt" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["deck"]>
  export type DeckInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    cardDecks?: boolean | Deck$cardDecksArgs<ExtArgs>
    _count?: boolean | DeckCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DeckIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DeckIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DeckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Deck"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      cardDecks: Prisma.$CardDeckPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string | null
      color: string | null
      isPublic: boolean
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["deck"]>
    composites: {}
  }

  type DeckGetPayload<S extends boolean | null | undefined | DeckDefaultArgs> = $Result.GetResult<Prisma.$DeckPayload, S>

  type DeckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeckCountAggregateInputType | true
    }

  export interface DeckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Deck'], meta: { name: 'Deck' } }
    /**
     * Find zero or one Deck that matches the filter.
     * @param {DeckFindUniqueArgs} args - Arguments to find a Deck
     * @example
     * // Get one Deck
     * const deck = await prisma.deck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeckFindUniqueArgs>(args: SelectSubset<T, DeckFindUniqueArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Deck that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeckFindUniqueOrThrowArgs} args - Arguments to find a Deck
     * @example
     * // Get one Deck
     * const deck = await prisma.deck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeckFindUniqueOrThrowArgs>(args: SelectSubset<T, DeckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Deck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckFindFirstArgs} args - Arguments to find a Deck
     * @example
     * // Get one Deck
     * const deck = await prisma.deck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeckFindFirstArgs>(args?: SelectSubset<T, DeckFindFirstArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Deck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckFindFirstOrThrowArgs} args - Arguments to find a Deck
     * @example
     * // Get one Deck
     * const deck = await prisma.deck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeckFindFirstOrThrowArgs>(args?: SelectSubset<T, DeckFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Decks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Decks
     * const decks = await prisma.deck.findMany()
     * 
     * // Get first 10 Decks
     * const decks = await prisma.deck.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deckWithIdOnly = await prisma.deck.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeckFindManyArgs>(args?: SelectSubset<T, DeckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Deck.
     * @param {DeckCreateArgs} args - Arguments to create a Deck.
     * @example
     * // Create one Deck
     * const Deck = await prisma.deck.create({
     *   data: {
     *     // ... data to create a Deck
     *   }
     * })
     * 
     */
    create<T extends DeckCreateArgs>(args: SelectSubset<T, DeckCreateArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Decks.
     * @param {DeckCreateManyArgs} args - Arguments to create many Decks.
     * @example
     * // Create many Decks
     * const deck = await prisma.deck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeckCreateManyArgs>(args?: SelectSubset<T, DeckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Decks and returns the data saved in the database.
     * @param {DeckCreateManyAndReturnArgs} args - Arguments to create many Decks.
     * @example
     * // Create many Decks
     * const deck = await prisma.deck.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Decks and only return the `id`
     * const deckWithIdOnly = await prisma.deck.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeckCreateManyAndReturnArgs>(args?: SelectSubset<T, DeckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Deck.
     * @param {DeckDeleteArgs} args - Arguments to delete one Deck.
     * @example
     * // Delete one Deck
     * const Deck = await prisma.deck.delete({
     *   where: {
     *     // ... filter to delete one Deck
     *   }
     * })
     * 
     */
    delete<T extends DeckDeleteArgs>(args: SelectSubset<T, DeckDeleteArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Deck.
     * @param {DeckUpdateArgs} args - Arguments to update one Deck.
     * @example
     * // Update one Deck
     * const deck = await prisma.deck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeckUpdateArgs>(args: SelectSubset<T, DeckUpdateArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Decks.
     * @param {DeckDeleteManyArgs} args - Arguments to filter Decks to delete.
     * @example
     * // Delete a few Decks
     * const { count } = await prisma.deck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeckDeleteManyArgs>(args?: SelectSubset<T, DeckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Decks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Decks
     * const deck = await prisma.deck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeckUpdateManyArgs>(args: SelectSubset<T, DeckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Decks and returns the data updated in the database.
     * @param {DeckUpdateManyAndReturnArgs} args - Arguments to update many Decks.
     * @example
     * // Update many Decks
     * const deck = await prisma.deck.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Decks and only return the `id`
     * const deckWithIdOnly = await prisma.deck.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DeckUpdateManyAndReturnArgs>(args: SelectSubset<T, DeckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Deck.
     * @param {DeckUpsertArgs} args - Arguments to update or create a Deck.
     * @example
     * // Update or create a Deck
     * const deck = await prisma.deck.upsert({
     *   create: {
     *     // ... data to create a Deck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Deck we want to update
     *   }
     * })
     */
    upsert<T extends DeckUpsertArgs>(args: SelectSubset<T, DeckUpsertArgs<ExtArgs>>): Prisma__DeckClient<$Result.GetResult<Prisma.$DeckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Decks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckCountArgs} args - Arguments to filter Decks to count.
     * @example
     * // Count the number of Decks
     * const count = await prisma.deck.count({
     *   where: {
     *     // ... the filter for the Decks we want to count
     *   }
     * })
    **/
    count<T extends DeckCountArgs>(
      args?: Subset<T, DeckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Deck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeckAggregateArgs>(args: Subset<T, DeckAggregateArgs>): Prisma.PrismaPromise<GetDeckAggregateType<T>>

    /**
     * Group by Deck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeckGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeckGroupByArgs['orderBy'] }
        : { orderBy?: DeckGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Deck model
   */
  readonly fields: DeckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Deck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cardDecks<T extends Deck$cardDecksArgs<ExtArgs> = {}>(args?: Subset<T, Deck$cardDecksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Deck model
   */
  interface DeckFieldRefs {
    readonly id: FieldRef<"Deck", 'String'>
    readonly title: FieldRef<"Deck", 'String'>
    readonly description: FieldRef<"Deck", 'String'>
    readonly color: FieldRef<"Deck", 'String'>
    readonly isPublic: FieldRef<"Deck", 'Boolean'>
    readonly deletedAt: FieldRef<"Deck", 'DateTime'>
    readonly createdAt: FieldRef<"Deck", 'DateTime'>
    readonly updatedAt: FieldRef<"Deck", 'DateTime'>
    readonly userId: FieldRef<"Deck", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Deck findUnique
   */
  export type DeckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter, which Deck to fetch.
     */
    where: DeckWhereUniqueInput
  }

  /**
   * Deck findUniqueOrThrow
   */
  export type DeckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter, which Deck to fetch.
     */
    where: DeckWhereUniqueInput
  }

  /**
   * Deck findFirst
   */
  export type DeckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter, which Deck to fetch.
     */
    where?: DeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Decks to fetch.
     */
    orderBy?: DeckOrderByWithRelationInput | DeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Decks.
     */
    cursor?: DeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Decks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Decks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Decks.
     */
    distinct?: DeckScalarFieldEnum | DeckScalarFieldEnum[]
  }

  /**
   * Deck findFirstOrThrow
   */
  export type DeckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter, which Deck to fetch.
     */
    where?: DeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Decks to fetch.
     */
    orderBy?: DeckOrderByWithRelationInput | DeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Decks.
     */
    cursor?: DeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Decks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Decks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Decks.
     */
    distinct?: DeckScalarFieldEnum | DeckScalarFieldEnum[]
  }

  /**
   * Deck findMany
   */
  export type DeckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter, which Decks to fetch.
     */
    where?: DeckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Decks to fetch.
     */
    orderBy?: DeckOrderByWithRelationInput | DeckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Decks.
     */
    cursor?: DeckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Decks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Decks.
     */
    skip?: number
    distinct?: DeckScalarFieldEnum | DeckScalarFieldEnum[]
  }

  /**
   * Deck create
   */
  export type DeckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * The data needed to create a Deck.
     */
    data: XOR<DeckCreateInput, DeckUncheckedCreateInput>
  }

  /**
   * Deck createMany
   */
  export type DeckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Decks.
     */
    data: DeckCreateManyInput | DeckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Deck createManyAndReturn
   */
  export type DeckCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * The data used to create many Decks.
     */
    data: DeckCreateManyInput | DeckCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Deck update
   */
  export type DeckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * The data needed to update a Deck.
     */
    data: XOR<DeckUpdateInput, DeckUncheckedUpdateInput>
    /**
     * Choose, which Deck to update.
     */
    where: DeckWhereUniqueInput
  }

  /**
   * Deck updateMany
   */
  export type DeckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Decks.
     */
    data: XOR<DeckUpdateManyMutationInput, DeckUncheckedUpdateManyInput>
    /**
     * Filter which Decks to update
     */
    where?: DeckWhereInput
    /**
     * Limit how many Decks to update.
     */
    limit?: number
  }

  /**
   * Deck updateManyAndReturn
   */
  export type DeckUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * The data used to update Decks.
     */
    data: XOR<DeckUpdateManyMutationInput, DeckUncheckedUpdateManyInput>
    /**
     * Filter which Decks to update
     */
    where?: DeckWhereInput
    /**
     * Limit how many Decks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Deck upsert
   */
  export type DeckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * The filter to search for the Deck to update in case it exists.
     */
    where: DeckWhereUniqueInput
    /**
     * In case the Deck found by the `where` argument doesn't exist, create a new Deck with this data.
     */
    create: XOR<DeckCreateInput, DeckUncheckedCreateInput>
    /**
     * In case the Deck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeckUpdateInput, DeckUncheckedUpdateInput>
  }

  /**
   * Deck delete
   */
  export type DeckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
    /**
     * Filter which Deck to delete.
     */
    where: DeckWhereUniqueInput
  }

  /**
   * Deck deleteMany
   */
  export type DeckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Decks to delete
     */
    where?: DeckWhereInput
    /**
     * Limit how many Decks to delete.
     */
    limit?: number
  }

  /**
   * Deck.cardDecks
   */
  export type Deck$cardDecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    where?: CardDeckWhereInput
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    cursor?: CardDeckWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CardDeckScalarFieldEnum | CardDeckScalarFieldEnum[]
  }

  /**
   * Deck without action
   */
  export type DeckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Deck
     */
    select?: DeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Deck
     */
    omit?: DeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeckInclude<ExtArgs> | null
  }


  /**
   * Model Card
   */

  export type AggregateCard = {
    _count: CardCountAggregateOutputType | null
    _avg: CardAvgAggregateOutputType | null
    _sum: CardSumAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  export type CardAvgAggregateOutputType = {
    interval: number | null
    easeFactor: number | null
    repetitions: number | null
  }

  export type CardSumAggregateOutputType = {
    interval: number | null
    easeFactor: number | null
    repetitions: number | null
  }

  export type CardMinAggregateOutputType = {
    id: string | null
    front: string | null
    back: string | null
    note: string | null
    nextReviewAt: Date | null
    interval: number | null
    easeFactor: number | null
    repetitions: number | null
    state: $Enums.CardState | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CardMaxAggregateOutputType = {
    id: string | null
    front: string | null
    back: string | null
    note: string | null
    nextReviewAt: Date | null
    interval: number | null
    easeFactor: number | null
    repetitions: number | null
    state: $Enums.CardState | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CardCountAggregateOutputType = {
    id: number
    front: number
    back: number
    note: number
    nextReviewAt: number
    interval: number
    easeFactor: number
    repetitions: number
    state: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CardAvgAggregateInputType = {
    interval?: true
    easeFactor?: true
    repetitions?: true
  }

  export type CardSumAggregateInputType = {
    interval?: true
    easeFactor?: true
    repetitions?: true
  }

  export type CardMinAggregateInputType = {
    id?: true
    front?: true
    back?: true
    note?: true
    nextReviewAt?: true
    interval?: true
    easeFactor?: true
    repetitions?: true
    state?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CardMaxAggregateInputType = {
    id?: true
    front?: true
    back?: true
    note?: true
    nextReviewAt?: true
    interval?: true
    easeFactor?: true
    repetitions?: true
    state?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CardCountAggregateInputType = {
    id?: true
    front?: true
    back?: true
    note?: true
    nextReviewAt?: true
    interval?: true
    easeFactor?: true
    repetitions?: true
    state?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Card to aggregate.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cards
    **/
    _count?: true | CardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CardMaxAggregateInputType
  }

  export type GetCardAggregateType<T extends CardAggregateArgs> = {
        [P in keyof T & keyof AggregateCard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCard[P]>
      : GetScalarType<T[P], AggregateCard[P]>
  }




  export type CardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardWhereInput
    orderBy?: CardOrderByWithAggregationInput | CardOrderByWithAggregationInput[]
    by: CardScalarFieldEnum[] | CardScalarFieldEnum
    having?: CardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CardCountAggregateInputType | true
    _avg?: CardAvgAggregateInputType
    _sum?: CardSumAggregateInputType
    _min?: CardMinAggregateInputType
    _max?: CardMaxAggregateInputType
  }

  export type CardGroupByOutputType = {
    id: string
    front: string
    back: string
    note: string | null
    nextReviewAt: Date
    interval: number
    easeFactor: number
    repetitions: number
    state: $Enums.CardState
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: CardCountAggregateOutputType | null
    _avg: CardAvgAggregateOutputType | null
    _sum: CardSumAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  type GetCardGroupByPayload<T extends CardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CardGroupByOutputType[P]>
            : GetScalarType<T[P], CardGroupByOutputType[P]>
        }
      >
    >


  export type CardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    front?: boolean
    back?: boolean
    note?: boolean
    nextReviewAt?: boolean
    interval?: boolean
    easeFactor?: boolean
    repetitions?: boolean
    state?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cardDecks?: boolean | Card$cardDecksArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    logs?: boolean | Card$logsArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["card"]>

  export type CardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    front?: boolean
    back?: boolean
    note?: boolean
    nextReviewAt?: boolean
    interval?: boolean
    easeFactor?: boolean
    repetitions?: boolean
    state?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["card"]>

  export type CardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    front?: boolean
    back?: boolean
    note?: boolean
    nextReviewAt?: boolean
    interval?: boolean
    easeFactor?: boolean
    repetitions?: boolean
    state?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["card"]>

  export type CardSelectScalar = {
    id?: boolean
    front?: boolean
    back?: boolean
    note?: boolean
    nextReviewAt?: boolean
    interval?: boolean
    easeFactor?: boolean
    repetitions?: boolean
    state?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "front" | "back" | "note" | "nextReviewAt" | "interval" | "easeFactor" | "repetitions" | "state" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["card"]>
  export type CardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cardDecks?: boolean | Card$cardDecksArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    logs?: boolean | Card$logsArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Card"
    objects: {
      cardDecks: Prisma.$CardDeckPayload<ExtArgs>[]
      user: Prisma.$UserPayload<ExtArgs>
      logs: Prisma.$ReviewLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      front: string
      back: string
      note: string | null
      nextReviewAt: Date
      interval: number
      easeFactor: number
      repetitions: number
      state: $Enums.CardState
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["card"]>
    composites: {}
  }

  type CardGetPayload<S extends boolean | null | undefined | CardDefaultArgs> = $Result.GetResult<Prisma.$CardPayload, S>

  type CardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CardCountAggregateInputType | true
    }

  export interface CardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Card'], meta: { name: 'Card' } }
    /**
     * Find zero or one Card that matches the filter.
     * @param {CardFindUniqueArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CardFindUniqueArgs>(args: SelectSubset<T, CardFindUniqueArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Card that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CardFindUniqueOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CardFindUniqueOrThrowArgs>(args: SelectSubset<T, CardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CardFindFirstArgs>(args?: SelectSubset<T, CardFindFirstArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CardFindFirstOrThrowArgs>(args?: SelectSubset<T, CardFindFirstOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cards
     * const cards = await prisma.card.findMany()
     * 
     * // Get first 10 Cards
     * const cards = await prisma.card.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cardWithIdOnly = await prisma.card.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CardFindManyArgs>(args?: SelectSubset<T, CardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Card.
     * @param {CardCreateArgs} args - Arguments to create a Card.
     * @example
     * // Create one Card
     * const Card = await prisma.card.create({
     *   data: {
     *     // ... data to create a Card
     *   }
     * })
     * 
     */
    create<T extends CardCreateArgs>(args: SelectSubset<T, CardCreateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cards.
     * @param {CardCreateManyArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CardCreateManyArgs>(args?: SelectSubset<T, CardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cards and returns the data saved in the database.
     * @param {CardCreateManyAndReturnArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CardCreateManyAndReturnArgs>(args?: SelectSubset<T, CardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Card.
     * @param {CardDeleteArgs} args - Arguments to delete one Card.
     * @example
     * // Delete one Card
     * const Card = await prisma.card.delete({
     *   where: {
     *     // ... filter to delete one Card
     *   }
     * })
     * 
     */
    delete<T extends CardDeleteArgs>(args: SelectSubset<T, CardDeleteArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Card.
     * @param {CardUpdateArgs} args - Arguments to update one Card.
     * @example
     * // Update one Card
     * const card = await prisma.card.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CardUpdateArgs>(args: SelectSubset<T, CardUpdateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cards.
     * @param {CardDeleteManyArgs} args - Arguments to filter Cards to delete.
     * @example
     * // Delete a few Cards
     * const { count } = await prisma.card.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CardDeleteManyArgs>(args?: SelectSubset<T, CardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CardUpdateManyArgs>(args: SelectSubset<T, CardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards and returns the data updated in the database.
     * @param {CardUpdateManyAndReturnArgs} args - Arguments to update many Cards.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CardUpdateManyAndReturnArgs>(args: SelectSubset<T, CardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Card.
     * @param {CardUpsertArgs} args - Arguments to update or create a Card.
     * @example
     * // Update or create a Card
     * const card = await prisma.card.upsert({
     *   create: {
     *     // ... data to create a Card
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Card we want to update
     *   }
     * })
     */
    upsert<T extends CardUpsertArgs>(args: SelectSubset<T, CardUpsertArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardCountArgs} args - Arguments to filter Cards to count.
     * @example
     * // Count the number of Cards
     * const count = await prisma.card.count({
     *   where: {
     *     // ... the filter for the Cards we want to count
     *   }
     * })
    **/
    count<T extends CardCountArgs>(
      args?: Subset<T, CardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CardAggregateArgs>(args: Subset<T, CardAggregateArgs>): Prisma.PrismaPromise<GetCardAggregateType<T>>

    /**
     * Group by Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CardGroupByArgs['orderBy'] }
        : { orderBy?: CardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Card model
   */
  readonly fields: CardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Card.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cardDecks<T extends Card$cardDecksArgs<ExtArgs> = {}>(args?: Subset<T, Card$cardDecksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardDeckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    logs<T extends Card$logsArgs<ExtArgs> = {}>(args?: Subset<T, Card$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Card model
   */
  interface CardFieldRefs {
    readonly id: FieldRef<"Card", 'String'>
    readonly front: FieldRef<"Card", 'String'>
    readonly back: FieldRef<"Card", 'String'>
    readonly note: FieldRef<"Card", 'String'>
    readonly nextReviewAt: FieldRef<"Card", 'DateTime'>
    readonly interval: FieldRef<"Card", 'Int'>
    readonly easeFactor: FieldRef<"Card", 'Float'>
    readonly repetitions: FieldRef<"Card", 'Int'>
    readonly state: FieldRef<"Card", 'CardState'>
    readonly userId: FieldRef<"Card", 'String'>
    readonly createdAt: FieldRef<"Card", 'DateTime'>
    readonly updatedAt: FieldRef<"Card", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Card findUnique
   */
  export type CardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findUniqueOrThrow
   */
  export type CardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findFirst
   */
  export type CardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findFirstOrThrow
   */
  export type CardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findMany
   */
  export type CardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Cards to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card create
   */
  export type CardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to create a Card.
     */
    data: XOR<CardCreateInput, CardUncheckedCreateInput>
  }

  /**
   * Card createMany
   */
  export type CardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Card createManyAndReturn
   */
  export type CardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Card update
   */
  export type CardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to update a Card.
     */
    data: XOR<CardUpdateInput, CardUncheckedUpdateInput>
    /**
     * Choose, which Card to update.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card updateMany
   */
  export type CardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
  }

  /**
   * Card updateManyAndReturn
   */
  export type CardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Card upsert
   */
  export type CardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The filter to search for the Card to update in case it exists.
     */
    where: CardWhereUniqueInput
    /**
     * In case the Card found by the `where` argument doesn't exist, create a new Card with this data.
     */
    create: XOR<CardCreateInput, CardUncheckedCreateInput>
    /**
     * In case the Card was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CardUpdateInput, CardUncheckedUpdateInput>
  }

  /**
   * Card delete
   */
  export type CardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter which Card to delete.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card deleteMany
   */
  export type CardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cards to delete
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to delete.
     */
    limit?: number
  }

  /**
   * Card.cardDecks
   */
  export type Card$cardDecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardDeck
     */
    select?: CardDeckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CardDeck
     */
    omit?: CardDeckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardDeckInclude<ExtArgs> | null
    where?: CardDeckWhereInput
    orderBy?: CardDeckOrderByWithRelationInput | CardDeckOrderByWithRelationInput[]
    cursor?: CardDeckWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CardDeckScalarFieldEnum | CardDeckScalarFieldEnum[]
  }

  /**
   * Card.logs
   */
  export type Card$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    cursor?: ReviewLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * Card without action
   */
  export type CardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
  }


  /**
   * Model ReviewLog
   */

  export type AggregateReviewLog = {
    _count: ReviewLogCountAggregateOutputType | null
    _avg: ReviewLogAvgAggregateOutputType | null
    _sum: ReviewLogSumAggregateOutputType | null
    _min: ReviewLogMinAggregateOutputType | null
    _max: ReviewLogMaxAggregateOutputType | null
  }

  export type ReviewLogAvgAggregateOutputType = {
    rating: number | null
    reviewTime: number | null
    scheduledDays: number | null
    elapsedDays: number | null
    lastEaseFactor: number | null
    newEaseFactor: number | null
  }

  export type ReviewLogSumAggregateOutputType = {
    rating: number | null
    reviewTime: number | null
    scheduledDays: number | null
    elapsedDays: number | null
    lastEaseFactor: number | null
    newEaseFactor: number | null
  }

  export type ReviewLogMinAggregateOutputType = {
    id: string | null
    rating: number | null
    reviewTime: number | null
    reviewedAt: Date | null
    scheduledDays: number | null
    elapsedDays: number | null
    lastEaseFactor: number | null
    newEaseFactor: number | null
    cardId: string | null
    userId: string | null
  }

  export type ReviewLogMaxAggregateOutputType = {
    id: string | null
    rating: number | null
    reviewTime: number | null
    reviewedAt: Date | null
    scheduledDays: number | null
    elapsedDays: number | null
    lastEaseFactor: number | null
    newEaseFactor: number | null
    cardId: string | null
    userId: string | null
  }

  export type ReviewLogCountAggregateOutputType = {
    id: number
    rating: number
    reviewTime: number
    reviewedAt: number
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: number
    userId: number
    _all: number
  }


  export type ReviewLogAvgAggregateInputType = {
    rating?: true
    reviewTime?: true
    scheduledDays?: true
    elapsedDays?: true
    lastEaseFactor?: true
    newEaseFactor?: true
  }

  export type ReviewLogSumAggregateInputType = {
    rating?: true
    reviewTime?: true
    scheduledDays?: true
    elapsedDays?: true
    lastEaseFactor?: true
    newEaseFactor?: true
  }

  export type ReviewLogMinAggregateInputType = {
    id?: true
    rating?: true
    reviewTime?: true
    reviewedAt?: true
    scheduledDays?: true
    elapsedDays?: true
    lastEaseFactor?: true
    newEaseFactor?: true
    cardId?: true
    userId?: true
  }

  export type ReviewLogMaxAggregateInputType = {
    id?: true
    rating?: true
    reviewTime?: true
    reviewedAt?: true
    scheduledDays?: true
    elapsedDays?: true
    lastEaseFactor?: true
    newEaseFactor?: true
    cardId?: true
    userId?: true
  }

  export type ReviewLogCountAggregateInputType = {
    id?: true
    rating?: true
    reviewTime?: true
    reviewedAt?: true
    scheduledDays?: true
    elapsedDays?: true
    lastEaseFactor?: true
    newEaseFactor?: true
    cardId?: true
    userId?: true
    _all?: true
  }

  export type ReviewLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewLog to aggregate.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReviewLogs
    **/
    _count?: true | ReviewLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewLogMaxAggregateInputType
  }

  export type GetReviewLogAggregateType<T extends ReviewLogAggregateArgs> = {
        [P in keyof T & keyof AggregateReviewLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReviewLog[P]>
      : GetScalarType<T[P], AggregateReviewLog[P]>
  }




  export type ReviewLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithAggregationInput | ReviewLogOrderByWithAggregationInput[]
    by: ReviewLogScalarFieldEnum[] | ReviewLogScalarFieldEnum
    having?: ReviewLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewLogCountAggregateInputType | true
    _avg?: ReviewLogAvgAggregateInputType
    _sum?: ReviewLogSumAggregateInputType
    _min?: ReviewLogMinAggregateInputType
    _max?: ReviewLogMaxAggregateInputType
  }

  export type ReviewLogGroupByOutputType = {
    id: string
    rating: number
    reviewTime: number
    reviewedAt: Date
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: string
    userId: string
    _count: ReviewLogCountAggregateOutputType | null
    _avg: ReviewLogAvgAggregateOutputType | null
    _sum: ReviewLogSumAggregateOutputType | null
    _min: ReviewLogMinAggregateOutputType | null
    _max: ReviewLogMaxAggregateOutputType | null
  }

  type GetReviewLogGroupByPayload<T extends ReviewLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewLogGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewLogGroupByOutputType[P]>
        }
      >
    >


  export type ReviewLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rating?: boolean
    reviewTime?: boolean
    reviewedAt?: boolean
    scheduledDays?: boolean
    elapsedDays?: boolean
    lastEaseFactor?: boolean
    newEaseFactor?: boolean
    cardId?: boolean
    userId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rating?: boolean
    reviewTime?: boolean
    reviewedAt?: boolean
    scheduledDays?: boolean
    elapsedDays?: boolean
    lastEaseFactor?: boolean
    newEaseFactor?: boolean
    cardId?: boolean
    userId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rating?: boolean
    reviewTime?: boolean
    reviewedAt?: boolean
    scheduledDays?: boolean
    elapsedDays?: boolean
    lastEaseFactor?: boolean
    newEaseFactor?: boolean
    cardId?: boolean
    userId?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectScalar = {
    id?: boolean
    rating?: boolean
    reviewTime?: boolean
    reviewedAt?: boolean
    scheduledDays?: boolean
    elapsedDays?: boolean
    lastEaseFactor?: boolean
    newEaseFactor?: boolean
    cardId?: boolean
    userId?: boolean
  }

  export type ReviewLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "rating" | "reviewTime" | "reviewedAt" | "scheduledDays" | "elapsedDays" | "lastEaseFactor" | "newEaseFactor" | "cardId" | "userId", ExtArgs["result"]["reviewLog"]>
  export type ReviewLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReviewLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReviewLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ReviewLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReviewLog"
    objects: {
      card: Prisma.$CardPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      rating: number
      reviewTime: number
      reviewedAt: Date
      scheduledDays: number
      elapsedDays: number
      lastEaseFactor: number
      newEaseFactor: number
      cardId: string
      userId: string
    }, ExtArgs["result"]["reviewLog"]>
    composites: {}
  }

  type ReviewLogGetPayload<S extends boolean | null | undefined | ReviewLogDefaultArgs> = $Result.GetResult<Prisma.$ReviewLogPayload, S>

  type ReviewLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReviewLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReviewLogCountAggregateInputType | true
    }

  export interface ReviewLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReviewLog'], meta: { name: 'ReviewLog' } }
    /**
     * Find zero or one ReviewLog that matches the filter.
     * @param {ReviewLogFindUniqueArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewLogFindUniqueArgs>(args: SelectSubset<T, ReviewLogFindUniqueArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReviewLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReviewLogFindUniqueOrThrowArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReviewLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindFirstArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewLogFindFirstArgs>(args?: SelectSubset<T, ReviewLogFindFirstArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReviewLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindFirstOrThrowArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReviewLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReviewLogs
     * const reviewLogs = await prisma.reviewLog.findMany()
     * 
     * // Get first 10 ReviewLogs
     * const reviewLogs = await prisma.reviewLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewLogFindManyArgs>(args?: SelectSubset<T, ReviewLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReviewLog.
     * @param {ReviewLogCreateArgs} args - Arguments to create a ReviewLog.
     * @example
     * // Create one ReviewLog
     * const ReviewLog = await prisma.reviewLog.create({
     *   data: {
     *     // ... data to create a ReviewLog
     *   }
     * })
     * 
     */
    create<T extends ReviewLogCreateArgs>(args: SelectSubset<T, ReviewLogCreateArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReviewLogs.
     * @param {ReviewLogCreateManyArgs} args - Arguments to create many ReviewLogs.
     * @example
     * // Create many ReviewLogs
     * const reviewLog = await prisma.reviewLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewLogCreateManyArgs>(args?: SelectSubset<T, ReviewLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReviewLogs and returns the data saved in the database.
     * @param {ReviewLogCreateManyAndReturnArgs} args - Arguments to create many ReviewLogs.
     * @example
     * // Create many ReviewLogs
     * const reviewLog = await prisma.reviewLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReviewLogs and only return the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReviewLog.
     * @param {ReviewLogDeleteArgs} args - Arguments to delete one ReviewLog.
     * @example
     * // Delete one ReviewLog
     * const ReviewLog = await prisma.reviewLog.delete({
     *   where: {
     *     // ... filter to delete one ReviewLog
     *   }
     * })
     * 
     */
    delete<T extends ReviewLogDeleteArgs>(args: SelectSubset<T, ReviewLogDeleteArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReviewLog.
     * @param {ReviewLogUpdateArgs} args - Arguments to update one ReviewLog.
     * @example
     * // Update one ReviewLog
     * const reviewLog = await prisma.reviewLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewLogUpdateArgs>(args: SelectSubset<T, ReviewLogUpdateArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReviewLogs.
     * @param {ReviewLogDeleteManyArgs} args - Arguments to filter ReviewLogs to delete.
     * @example
     * // Delete a few ReviewLogs
     * const { count } = await prisma.reviewLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewLogDeleteManyArgs>(args?: SelectSubset<T, ReviewLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReviewLogs
     * const reviewLog = await prisma.reviewLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewLogUpdateManyArgs>(args: SelectSubset<T, ReviewLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewLogs and returns the data updated in the database.
     * @param {ReviewLogUpdateManyAndReturnArgs} args - Arguments to update many ReviewLogs.
     * @example
     * // Update many ReviewLogs
     * const reviewLog = await prisma.reviewLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReviewLogs and only return the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReviewLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ReviewLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReviewLog.
     * @param {ReviewLogUpsertArgs} args - Arguments to update or create a ReviewLog.
     * @example
     * // Update or create a ReviewLog
     * const reviewLog = await prisma.reviewLog.upsert({
     *   create: {
     *     // ... data to create a ReviewLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReviewLog we want to update
     *   }
     * })
     */
    upsert<T extends ReviewLogUpsertArgs>(args: SelectSubset<T, ReviewLogUpsertArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReviewLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogCountArgs} args - Arguments to filter ReviewLogs to count.
     * @example
     * // Count the number of ReviewLogs
     * const count = await prisma.reviewLog.count({
     *   where: {
     *     // ... the filter for the ReviewLogs we want to count
     *   }
     * })
    **/
    count<T extends ReviewLogCountArgs>(
      args?: Subset<T, ReviewLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReviewLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReviewLogAggregateArgs>(args: Subset<T, ReviewLogAggregateArgs>): Prisma.PrismaPromise<GetReviewLogAggregateType<T>>

    /**
     * Group by ReviewLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReviewLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewLogGroupByArgs['orderBy'] }
        : { orderBy?: ReviewLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReviewLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReviewLog model
   */
  readonly fields: ReviewLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReviewLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    card<T extends CardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CardDefaultArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReviewLog model
   */
  interface ReviewLogFieldRefs {
    readonly id: FieldRef<"ReviewLog", 'String'>
    readonly rating: FieldRef<"ReviewLog", 'Int'>
    readonly reviewTime: FieldRef<"ReviewLog", 'Int'>
    readonly reviewedAt: FieldRef<"ReviewLog", 'DateTime'>
    readonly scheduledDays: FieldRef<"ReviewLog", 'Int'>
    readonly elapsedDays: FieldRef<"ReviewLog", 'Int'>
    readonly lastEaseFactor: FieldRef<"ReviewLog", 'Float'>
    readonly newEaseFactor: FieldRef<"ReviewLog", 'Float'>
    readonly cardId: FieldRef<"ReviewLog", 'String'>
    readonly userId: FieldRef<"ReviewLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReviewLog findUnique
   */
  export type ReviewLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog findUniqueOrThrow
   */
  export type ReviewLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog findFirst
   */
  export type ReviewLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewLogs.
     */
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog findFirstOrThrow
   */
  export type ReviewLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewLogs.
     */
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog findMany
   */
  export type ReviewLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLogs to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog create
   */
  export type ReviewLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ReviewLog.
     */
    data: XOR<ReviewLogCreateInput, ReviewLogUncheckedCreateInput>
  }

  /**
   * ReviewLog createMany
   */
  export type ReviewLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReviewLogs.
     */
    data: ReviewLogCreateManyInput | ReviewLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReviewLog createManyAndReturn
   */
  export type ReviewLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * The data used to create many ReviewLogs.
     */
    data: ReviewLogCreateManyInput | ReviewLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewLog update
   */
  export type ReviewLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ReviewLog.
     */
    data: XOR<ReviewLogUpdateInput, ReviewLogUncheckedUpdateInput>
    /**
     * Choose, which ReviewLog to update.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog updateMany
   */
  export type ReviewLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReviewLogs.
     */
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyInput>
    /**
     * Filter which ReviewLogs to update
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to update.
     */
    limit?: number
  }

  /**
   * ReviewLog updateManyAndReturn
   */
  export type ReviewLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * The data used to update ReviewLogs.
     */
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyInput>
    /**
     * Filter which ReviewLogs to update
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewLog upsert
   */
  export type ReviewLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ReviewLog to update in case it exists.
     */
    where: ReviewLogWhereUniqueInput
    /**
     * In case the ReviewLog found by the `where` argument doesn't exist, create a new ReviewLog with this data.
     */
    create: XOR<ReviewLogCreateInput, ReviewLogUncheckedCreateInput>
    /**
     * In case the ReviewLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewLogUpdateInput, ReviewLogUncheckedUpdateInput>
  }

  /**
   * ReviewLog delete
   */
  export type ReviewLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter which ReviewLog to delete.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog deleteMany
   */
  export type ReviewLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewLogs to delete
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to delete.
     */
    limit?: number
  }

  /**
   * ReviewLog without action
   */
  export type ReviewLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CardDeckScalarFieldEnum: {
    cardId: 'cardId',
    deckId: 'deckId'
  };

  export type CardDeckScalarFieldEnum = (typeof CardDeckScalarFieldEnum)[keyof typeof CardDeckScalarFieldEnum]


  export const DeckScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    color: 'color',
    isPublic: 'isPublic',
    deletedAt: 'deletedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type DeckScalarFieldEnum = (typeof DeckScalarFieldEnum)[keyof typeof DeckScalarFieldEnum]


  export const CardScalarFieldEnum: {
    id: 'id',
    front: 'front',
    back: 'back',
    note: 'note',
    nextReviewAt: 'nextReviewAt',
    interval: 'interval',
    easeFactor: 'easeFactor',
    repetitions: 'repetitions',
    state: 'state',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CardScalarFieldEnum = (typeof CardScalarFieldEnum)[keyof typeof CardScalarFieldEnum]


  export const ReviewLogScalarFieldEnum: {
    id: 'id',
    rating: 'rating',
    reviewTime: 'reviewTime',
    reviewedAt: 'reviewedAt',
    scheduledDays: 'scheduledDays',
    elapsedDays: 'elapsedDays',
    lastEaseFactor: 'lastEaseFactor',
    newEaseFactor: 'newEaseFactor',
    cardId: 'cardId',
    userId: 'userId'
  };

  export type ReviewLogScalarFieldEnum = (typeof ReviewLogScalarFieldEnum)[keyof typeof ReviewLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'CardState'
   */
  export type EnumCardStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CardState'>
    


  /**
   * Reference to a field of type 'CardState[]'
   */
  export type ListEnumCardStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CardState[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    decks?: DeckListRelationFilter
    cards?: CardListRelationFilter
    logs?: ReviewLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    decks?: DeckOrderByRelationAggregateInput
    cards?: CardOrderByRelationAggregateInput
    logs?: ReviewLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    decks?: DeckListRelationFilter
    cards?: CardListRelationFilter
    logs?: ReviewLogListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CardDeckWhereInput = {
    AND?: CardDeckWhereInput | CardDeckWhereInput[]
    OR?: CardDeckWhereInput[]
    NOT?: CardDeckWhereInput | CardDeckWhereInput[]
    cardId?: StringFilter<"CardDeck"> | string
    deckId?: StringFilter<"CardDeck"> | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    deck?: XOR<DeckScalarRelationFilter, DeckWhereInput>
  }

  export type CardDeckOrderByWithRelationInput = {
    cardId?: SortOrder
    deckId?: SortOrder
    card?: CardOrderByWithRelationInput
    deck?: DeckOrderByWithRelationInput
  }

  export type CardDeckWhereUniqueInput = Prisma.AtLeast<{
    cardId_deckId?: CardDeckCardIdDeckIdCompoundUniqueInput
    AND?: CardDeckWhereInput | CardDeckWhereInput[]
    OR?: CardDeckWhereInput[]
    NOT?: CardDeckWhereInput | CardDeckWhereInput[]
    cardId?: StringFilter<"CardDeck"> | string
    deckId?: StringFilter<"CardDeck"> | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    deck?: XOR<DeckScalarRelationFilter, DeckWhereInput>
  }, "cardId_deckId">

  export type CardDeckOrderByWithAggregationInput = {
    cardId?: SortOrder
    deckId?: SortOrder
    _count?: CardDeckCountOrderByAggregateInput
    _max?: CardDeckMaxOrderByAggregateInput
    _min?: CardDeckMinOrderByAggregateInput
  }

  export type CardDeckScalarWhereWithAggregatesInput = {
    AND?: CardDeckScalarWhereWithAggregatesInput | CardDeckScalarWhereWithAggregatesInput[]
    OR?: CardDeckScalarWhereWithAggregatesInput[]
    NOT?: CardDeckScalarWhereWithAggregatesInput | CardDeckScalarWhereWithAggregatesInput[]
    cardId?: StringWithAggregatesFilter<"CardDeck"> | string
    deckId?: StringWithAggregatesFilter<"CardDeck"> | string
  }

  export type DeckWhereInput = {
    AND?: DeckWhereInput | DeckWhereInput[]
    OR?: DeckWhereInput[]
    NOT?: DeckWhereInput | DeckWhereInput[]
    id?: StringFilter<"Deck"> | string
    title?: StringFilter<"Deck"> | string
    description?: StringNullableFilter<"Deck"> | string | null
    color?: StringNullableFilter<"Deck"> | string | null
    isPublic?: BoolFilter<"Deck"> | boolean
    deletedAt?: DateTimeNullableFilter<"Deck"> | Date | string | null
    createdAt?: DateTimeFilter<"Deck"> | Date | string
    updatedAt?: DateTimeFilter<"Deck"> | Date | string
    userId?: StringFilter<"Deck"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    cardDecks?: CardDeckListRelationFilter
  }

  export type DeckOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    cardDecks?: CardDeckOrderByRelationAggregateInput
  }

  export type DeckWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_title?: DeckUserIdTitleCompoundUniqueInput
    AND?: DeckWhereInput | DeckWhereInput[]
    OR?: DeckWhereInput[]
    NOT?: DeckWhereInput | DeckWhereInput[]
    title?: StringFilter<"Deck"> | string
    description?: StringNullableFilter<"Deck"> | string | null
    color?: StringNullableFilter<"Deck"> | string | null
    isPublic?: BoolFilter<"Deck"> | boolean
    deletedAt?: DateTimeNullableFilter<"Deck"> | Date | string | null
    createdAt?: DateTimeFilter<"Deck"> | Date | string
    updatedAt?: DateTimeFilter<"Deck"> | Date | string
    userId?: StringFilter<"Deck"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    cardDecks?: CardDeckListRelationFilter
  }, "id" | "userId_title">

  export type DeckOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: DeckCountOrderByAggregateInput
    _max?: DeckMaxOrderByAggregateInput
    _min?: DeckMinOrderByAggregateInput
  }

  export type DeckScalarWhereWithAggregatesInput = {
    AND?: DeckScalarWhereWithAggregatesInput | DeckScalarWhereWithAggregatesInput[]
    OR?: DeckScalarWhereWithAggregatesInput[]
    NOT?: DeckScalarWhereWithAggregatesInput | DeckScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Deck"> | string
    title?: StringWithAggregatesFilter<"Deck"> | string
    description?: StringNullableWithAggregatesFilter<"Deck"> | string | null
    color?: StringNullableWithAggregatesFilter<"Deck"> | string | null
    isPublic?: BoolWithAggregatesFilter<"Deck"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Deck"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Deck"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Deck"> | Date | string
    userId?: StringWithAggregatesFilter<"Deck"> | string
  }

  export type CardWhereInput = {
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    id?: StringFilter<"Card"> | string
    front?: StringFilter<"Card"> | string
    back?: StringFilter<"Card"> | string
    note?: StringNullableFilter<"Card"> | string | null
    nextReviewAt?: DateTimeFilter<"Card"> | Date | string
    interval?: IntFilter<"Card"> | number
    easeFactor?: FloatFilter<"Card"> | number
    repetitions?: IntFilter<"Card"> | number
    state?: EnumCardStateFilter<"Card"> | $Enums.CardState
    userId?: StringFilter<"Card"> | string
    createdAt?: DateTimeFilter<"Card"> | Date | string
    updatedAt?: DateTimeFilter<"Card"> | Date | string
    cardDecks?: CardDeckListRelationFilter
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    logs?: ReviewLogListRelationFilter
  }

  export type CardOrderByWithRelationInput = {
    id?: SortOrder
    front?: SortOrder
    back?: SortOrder
    note?: SortOrderInput | SortOrder
    nextReviewAt?: SortOrder
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
    state?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cardDecks?: CardDeckOrderByRelationAggregateInput
    user?: UserOrderByWithRelationInput
    logs?: ReviewLogOrderByRelationAggregateInput
  }

  export type CardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    front?: StringFilter<"Card"> | string
    back?: StringFilter<"Card"> | string
    note?: StringNullableFilter<"Card"> | string | null
    nextReviewAt?: DateTimeFilter<"Card"> | Date | string
    interval?: IntFilter<"Card"> | number
    easeFactor?: FloatFilter<"Card"> | number
    repetitions?: IntFilter<"Card"> | number
    state?: EnumCardStateFilter<"Card"> | $Enums.CardState
    userId?: StringFilter<"Card"> | string
    createdAt?: DateTimeFilter<"Card"> | Date | string
    updatedAt?: DateTimeFilter<"Card"> | Date | string
    cardDecks?: CardDeckListRelationFilter
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    logs?: ReviewLogListRelationFilter
  }, "id">

  export type CardOrderByWithAggregationInput = {
    id?: SortOrder
    front?: SortOrder
    back?: SortOrder
    note?: SortOrderInput | SortOrder
    nextReviewAt?: SortOrder
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
    state?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CardCountOrderByAggregateInput
    _avg?: CardAvgOrderByAggregateInput
    _max?: CardMaxOrderByAggregateInput
    _min?: CardMinOrderByAggregateInput
    _sum?: CardSumOrderByAggregateInput
  }

  export type CardScalarWhereWithAggregatesInput = {
    AND?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    OR?: CardScalarWhereWithAggregatesInput[]
    NOT?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Card"> | string
    front?: StringWithAggregatesFilter<"Card"> | string
    back?: StringWithAggregatesFilter<"Card"> | string
    note?: StringNullableWithAggregatesFilter<"Card"> | string | null
    nextReviewAt?: DateTimeWithAggregatesFilter<"Card"> | Date | string
    interval?: IntWithAggregatesFilter<"Card"> | number
    easeFactor?: FloatWithAggregatesFilter<"Card"> | number
    repetitions?: IntWithAggregatesFilter<"Card"> | number
    state?: EnumCardStateWithAggregatesFilter<"Card"> | $Enums.CardState
    userId?: StringWithAggregatesFilter<"Card"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Card"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Card"> | Date | string
  }

  export type ReviewLogWhereInput = {
    AND?: ReviewLogWhereInput | ReviewLogWhereInput[]
    OR?: ReviewLogWhereInput[]
    NOT?: ReviewLogWhereInput | ReviewLogWhereInput[]
    id?: StringFilter<"ReviewLog"> | string
    rating?: IntFilter<"ReviewLog"> | number
    reviewTime?: IntFilter<"ReviewLog"> | number
    reviewedAt?: DateTimeFilter<"ReviewLog"> | Date | string
    scheduledDays?: IntFilter<"ReviewLog"> | number
    elapsedDays?: IntFilter<"ReviewLog"> | number
    lastEaseFactor?: FloatFilter<"ReviewLog"> | number
    newEaseFactor?: FloatFilter<"ReviewLog"> | number
    cardId?: StringFilter<"ReviewLog"> | string
    userId?: StringFilter<"ReviewLog"> | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ReviewLogOrderByWithRelationInput = {
    id?: SortOrder
    rating?: SortOrder
    reviewTime?: SortOrder
    reviewedAt?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
    cardId?: SortOrder
    userId?: SortOrder
    card?: CardOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type ReviewLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReviewLogWhereInput | ReviewLogWhereInput[]
    OR?: ReviewLogWhereInput[]
    NOT?: ReviewLogWhereInput | ReviewLogWhereInput[]
    rating?: IntFilter<"ReviewLog"> | number
    reviewTime?: IntFilter<"ReviewLog"> | number
    reviewedAt?: DateTimeFilter<"ReviewLog"> | Date | string
    scheduledDays?: IntFilter<"ReviewLog"> | number
    elapsedDays?: IntFilter<"ReviewLog"> | number
    lastEaseFactor?: FloatFilter<"ReviewLog"> | number
    newEaseFactor?: FloatFilter<"ReviewLog"> | number
    cardId?: StringFilter<"ReviewLog"> | string
    userId?: StringFilter<"ReviewLog"> | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ReviewLogOrderByWithAggregationInput = {
    id?: SortOrder
    rating?: SortOrder
    reviewTime?: SortOrder
    reviewedAt?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
    cardId?: SortOrder
    userId?: SortOrder
    _count?: ReviewLogCountOrderByAggregateInput
    _avg?: ReviewLogAvgOrderByAggregateInput
    _max?: ReviewLogMaxOrderByAggregateInput
    _min?: ReviewLogMinOrderByAggregateInput
    _sum?: ReviewLogSumOrderByAggregateInput
  }

  export type ReviewLogScalarWhereWithAggregatesInput = {
    AND?: ReviewLogScalarWhereWithAggregatesInput | ReviewLogScalarWhereWithAggregatesInput[]
    OR?: ReviewLogScalarWhereWithAggregatesInput[]
    NOT?: ReviewLogScalarWhereWithAggregatesInput | ReviewLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReviewLog"> | string
    rating?: IntWithAggregatesFilter<"ReviewLog"> | number
    reviewTime?: IntWithAggregatesFilter<"ReviewLog"> | number
    reviewedAt?: DateTimeWithAggregatesFilter<"ReviewLog"> | Date | string
    scheduledDays?: IntWithAggregatesFilter<"ReviewLog"> | number
    elapsedDays?: IntWithAggregatesFilter<"ReviewLog"> | number
    lastEaseFactor?: FloatWithAggregatesFilter<"ReviewLog"> | number
    newEaseFactor?: FloatWithAggregatesFilter<"ReviewLog"> | number
    cardId?: StringWithAggregatesFilter<"ReviewLog"> | string
    userId?: StringWithAggregatesFilter<"ReviewLog"> | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckCreateNestedManyWithoutUserInput
    cards?: CardCreateNestedManyWithoutUserInput
    logs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckUncheckedCreateNestedManyWithoutUserInput
    cards?: CardUncheckedCreateNestedManyWithoutUserInput
    logs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUpdateManyWithoutUserNestedInput
    cards?: CardUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUncheckedUpdateManyWithoutUserNestedInput
    cards?: CardUncheckedUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CardDeckCreateInput = {
    card: CardCreateNestedOneWithoutCardDecksInput
    deck: DeckCreateNestedOneWithoutCardDecksInput
  }

  export type CardDeckUncheckedCreateInput = {
    cardId: string
    deckId: string
  }

  export type CardDeckUpdateInput = {
    card?: CardUpdateOneRequiredWithoutCardDecksNestedInput
    deck?: DeckUpdateOneRequiredWithoutCardDecksNestedInput
  }

  export type CardDeckUncheckedUpdateInput = {
    cardId?: StringFieldUpdateOperationsInput | string
    deckId?: StringFieldUpdateOperationsInput | string
  }

  export type CardDeckCreateManyInput = {
    cardId: string
    deckId: string
  }

  export type CardDeckUpdateManyMutationInput = {

  }

  export type CardDeckUncheckedUpdateManyInput = {
    cardId?: StringFieldUpdateOperationsInput | string
    deckId?: StringFieldUpdateOperationsInput | string
  }

  export type DeckCreateInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDecksInput
    cardDecks?: CardDeckCreateNestedManyWithoutDeckInput
  }

  export type DeckUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    cardDecks?: CardDeckUncheckedCreateNestedManyWithoutDeckInput
  }

  export type DeckUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDecksNestedInput
    cardDecks?: CardDeckUpdateManyWithoutDeckNestedInput
  }

  export type DeckUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    cardDecks?: CardDeckUncheckedUpdateManyWithoutDeckNestedInput
  }

  export type DeckCreateManyInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type DeckUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeckUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type CardCreateInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckCreateNestedManyWithoutCardInput
    user: UserCreateNestedOneWithoutCardsInput
    logs?: ReviewLogCreateNestedManyWithoutCardInput
  }

  export type CardUncheckedCreateInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckUncheckedCreateNestedManyWithoutCardInput
    logs?: ReviewLogUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUpdateManyWithoutCardNestedInput
    user?: UserUpdateOneRequiredWithoutCardsNestedInput
    logs?: ReviewLogUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUncheckedUpdateManyWithoutCardNestedInput
    logs?: ReviewLogUncheckedUpdateManyWithoutCardNestedInput
  }

  export type CardCreateManyInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogCreateInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    card: CardCreateNestedOneWithoutLogsInput
    user: UserCreateNestedOneWithoutLogsInput
  }

  export type ReviewLogUncheckedCreateInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: string
    userId: string
  }

  export type ReviewLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    card?: CardUpdateOneRequiredWithoutLogsNestedInput
    user?: UserUpdateOneRequiredWithoutLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ReviewLogCreateManyInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: string
    userId: string
  }

  export type ReviewLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
  }

  export type ReviewLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DeckListRelationFilter = {
    every?: DeckWhereInput
    some?: DeckWhereInput
    none?: DeckWhereInput
  }

  export type CardListRelationFilter = {
    every?: CardWhereInput
    some?: CardWhereInput
    none?: CardWhereInput
  }

  export type ReviewLogListRelationFilter = {
    every?: ReviewLogWhereInput
    some?: ReviewLogWhereInput
    none?: ReviewLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DeckOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReviewLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CardScalarRelationFilter = {
    is?: CardWhereInput
    isNot?: CardWhereInput
  }

  export type DeckScalarRelationFilter = {
    is?: DeckWhereInput
    isNot?: DeckWhereInput
  }

  export type CardDeckCardIdDeckIdCompoundUniqueInput = {
    cardId: string
    deckId: string
  }

  export type CardDeckCountOrderByAggregateInput = {
    cardId?: SortOrder
    deckId?: SortOrder
  }

  export type CardDeckMaxOrderByAggregateInput = {
    cardId?: SortOrder
    deckId?: SortOrder
  }

  export type CardDeckMinOrderByAggregateInput = {
    cardId?: SortOrder
    deckId?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type CardDeckListRelationFilter = {
    every?: CardDeckWhereInput
    some?: CardDeckWhereInput
    none?: CardDeckWhereInput
  }

  export type CardDeckOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DeckUserIdTitleCompoundUniqueInput = {
    userId: string
    title: string
  }

  export type DeckCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isPublic?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DeckMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isPublic?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type DeckMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isPublic?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumCardStateFilter<$PrismaModel = never> = {
    equals?: $Enums.CardState | EnumCardStateFieldRefInput<$PrismaModel>
    in?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    not?: NestedEnumCardStateFilter<$PrismaModel> | $Enums.CardState
  }

  export type CardCountOrderByAggregateInput = {
    id?: SortOrder
    front?: SortOrder
    back?: SortOrder
    note?: SortOrder
    nextReviewAt?: SortOrder
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
    state?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CardAvgOrderByAggregateInput = {
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
  }

  export type CardMaxOrderByAggregateInput = {
    id?: SortOrder
    front?: SortOrder
    back?: SortOrder
    note?: SortOrder
    nextReviewAt?: SortOrder
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
    state?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CardMinOrderByAggregateInput = {
    id?: SortOrder
    front?: SortOrder
    back?: SortOrder
    note?: SortOrder
    nextReviewAt?: SortOrder
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
    state?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CardSumOrderByAggregateInput = {
    interval?: SortOrder
    easeFactor?: SortOrder
    repetitions?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumCardStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CardState | EnumCardStateFieldRefInput<$PrismaModel>
    in?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    not?: NestedEnumCardStateWithAggregatesFilter<$PrismaModel> | $Enums.CardState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCardStateFilter<$PrismaModel>
    _max?: NestedEnumCardStateFilter<$PrismaModel>
  }

  export type ReviewLogCountOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    reviewTime?: SortOrder
    reviewedAt?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
    cardId?: SortOrder
    userId?: SortOrder
  }

  export type ReviewLogAvgOrderByAggregateInput = {
    rating?: SortOrder
    reviewTime?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
  }

  export type ReviewLogMaxOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    reviewTime?: SortOrder
    reviewedAt?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
    cardId?: SortOrder
    userId?: SortOrder
  }

  export type ReviewLogMinOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    reviewTime?: SortOrder
    reviewedAt?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
    cardId?: SortOrder
    userId?: SortOrder
  }

  export type ReviewLogSumOrderByAggregateInput = {
    rating?: SortOrder
    reviewTime?: SortOrder
    scheduledDays?: SortOrder
    elapsedDays?: SortOrder
    lastEaseFactor?: SortOrder
    newEaseFactor?: SortOrder
  }

  export type DeckCreateNestedManyWithoutUserInput = {
    create?: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput> | DeckCreateWithoutUserInput[] | DeckUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeckCreateOrConnectWithoutUserInput | DeckCreateOrConnectWithoutUserInput[]
    createMany?: DeckCreateManyUserInputEnvelope
    connect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
  }

  export type CardCreateNestedManyWithoutUserInput = {
    create?: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput> | CardCreateWithoutUserInput[] | CardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CardCreateOrConnectWithoutUserInput | CardCreateOrConnectWithoutUserInput[]
    createMany?: CardCreateManyUserInputEnvelope
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[]
  }

  export type ReviewLogCreateNestedManyWithoutUserInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type DeckUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput> | DeckCreateWithoutUserInput[] | DeckUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeckCreateOrConnectWithoutUserInput | DeckCreateOrConnectWithoutUserInput[]
    createMany?: DeckCreateManyUserInputEnvelope
    connect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
  }

  export type CardUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput> | CardCreateWithoutUserInput[] | CardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CardCreateOrConnectWithoutUserInput | CardCreateOrConnectWithoutUserInput[]
    createMany?: CardCreateManyUserInputEnvelope
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[]
  }

  export type ReviewLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DeckUpdateManyWithoutUserNestedInput = {
    create?: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput> | DeckCreateWithoutUserInput[] | DeckUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeckCreateOrConnectWithoutUserInput | DeckCreateOrConnectWithoutUserInput[]
    upsert?: DeckUpsertWithWhereUniqueWithoutUserInput | DeckUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DeckCreateManyUserInputEnvelope
    set?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    disconnect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    delete?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    connect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    update?: DeckUpdateWithWhereUniqueWithoutUserInput | DeckUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DeckUpdateManyWithWhereWithoutUserInput | DeckUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DeckScalarWhereInput | DeckScalarWhereInput[]
  }

  export type CardUpdateManyWithoutUserNestedInput = {
    create?: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput> | CardCreateWithoutUserInput[] | CardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CardCreateOrConnectWithoutUserInput | CardCreateOrConnectWithoutUserInput[]
    upsert?: CardUpsertWithWhereUniqueWithoutUserInput | CardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CardCreateManyUserInputEnvelope
    set?: CardWhereUniqueInput | CardWhereUniqueInput[]
    disconnect?: CardWhereUniqueInput | CardWhereUniqueInput[]
    delete?: CardWhereUniqueInput | CardWhereUniqueInput[]
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[]
    update?: CardUpdateWithWhereUniqueWithoutUserInput | CardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CardUpdateManyWithWhereWithoutUserInput | CardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CardScalarWhereInput | CardScalarWhereInput[]
  }

  export type ReviewLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutUserInput | ReviewLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutUserInput | ReviewLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutUserInput | ReviewLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type DeckUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput> | DeckCreateWithoutUserInput[] | DeckUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DeckCreateOrConnectWithoutUserInput | DeckCreateOrConnectWithoutUserInput[]
    upsert?: DeckUpsertWithWhereUniqueWithoutUserInput | DeckUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DeckCreateManyUserInputEnvelope
    set?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    disconnect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    delete?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    connect?: DeckWhereUniqueInput | DeckWhereUniqueInput[]
    update?: DeckUpdateWithWhereUniqueWithoutUserInput | DeckUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DeckUpdateManyWithWhereWithoutUserInput | DeckUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DeckScalarWhereInput | DeckScalarWhereInput[]
  }

  export type CardUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput> | CardCreateWithoutUserInput[] | CardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CardCreateOrConnectWithoutUserInput | CardCreateOrConnectWithoutUserInput[]
    upsert?: CardUpsertWithWhereUniqueWithoutUserInput | CardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CardCreateManyUserInputEnvelope
    set?: CardWhereUniqueInput | CardWhereUniqueInput[]
    disconnect?: CardWhereUniqueInput | CardWhereUniqueInput[]
    delete?: CardWhereUniqueInput | CardWhereUniqueInput[]
    connect?: CardWhereUniqueInput | CardWhereUniqueInput[]
    update?: CardUpdateWithWhereUniqueWithoutUserInput | CardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CardUpdateManyWithWhereWithoutUserInput | CardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CardScalarWhereInput | CardScalarWhereInput[]
  }

  export type ReviewLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutUserInput | ReviewLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutUserInput | ReviewLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutUserInput | ReviewLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type CardCreateNestedOneWithoutCardDecksInput = {
    create?: XOR<CardCreateWithoutCardDecksInput, CardUncheckedCreateWithoutCardDecksInput>
    connectOrCreate?: CardCreateOrConnectWithoutCardDecksInput
    connect?: CardWhereUniqueInput
  }

  export type DeckCreateNestedOneWithoutCardDecksInput = {
    create?: XOR<DeckCreateWithoutCardDecksInput, DeckUncheckedCreateWithoutCardDecksInput>
    connectOrCreate?: DeckCreateOrConnectWithoutCardDecksInput
    connect?: DeckWhereUniqueInput
  }

  export type CardUpdateOneRequiredWithoutCardDecksNestedInput = {
    create?: XOR<CardCreateWithoutCardDecksInput, CardUncheckedCreateWithoutCardDecksInput>
    connectOrCreate?: CardCreateOrConnectWithoutCardDecksInput
    upsert?: CardUpsertWithoutCardDecksInput
    connect?: CardWhereUniqueInput
    update?: XOR<XOR<CardUpdateToOneWithWhereWithoutCardDecksInput, CardUpdateWithoutCardDecksInput>, CardUncheckedUpdateWithoutCardDecksInput>
  }

  export type DeckUpdateOneRequiredWithoutCardDecksNestedInput = {
    create?: XOR<DeckCreateWithoutCardDecksInput, DeckUncheckedCreateWithoutCardDecksInput>
    connectOrCreate?: DeckCreateOrConnectWithoutCardDecksInput
    upsert?: DeckUpsertWithoutCardDecksInput
    connect?: DeckWhereUniqueInput
    update?: XOR<XOR<DeckUpdateToOneWithWhereWithoutCardDecksInput, DeckUpdateWithoutCardDecksInput>, DeckUncheckedUpdateWithoutCardDecksInput>
  }

  export type UserCreateNestedOneWithoutDecksInput = {
    create?: XOR<UserCreateWithoutDecksInput, UserUncheckedCreateWithoutDecksInput>
    connectOrCreate?: UserCreateOrConnectWithoutDecksInput
    connect?: UserWhereUniqueInput
  }

  export type CardDeckCreateNestedManyWithoutDeckInput = {
    create?: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput> | CardDeckCreateWithoutDeckInput[] | CardDeckUncheckedCreateWithoutDeckInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutDeckInput | CardDeckCreateOrConnectWithoutDeckInput[]
    createMany?: CardDeckCreateManyDeckInputEnvelope
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
  }

  export type CardDeckUncheckedCreateNestedManyWithoutDeckInput = {
    create?: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput> | CardDeckCreateWithoutDeckInput[] | CardDeckUncheckedCreateWithoutDeckInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutDeckInput | CardDeckCreateOrConnectWithoutDeckInput[]
    createMany?: CardDeckCreateManyDeckInputEnvelope
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutDecksNestedInput = {
    create?: XOR<UserCreateWithoutDecksInput, UserUncheckedCreateWithoutDecksInput>
    connectOrCreate?: UserCreateOrConnectWithoutDecksInput
    upsert?: UserUpsertWithoutDecksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDecksInput, UserUpdateWithoutDecksInput>, UserUncheckedUpdateWithoutDecksInput>
  }

  export type CardDeckUpdateManyWithoutDeckNestedInput = {
    create?: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput> | CardDeckCreateWithoutDeckInput[] | CardDeckUncheckedCreateWithoutDeckInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutDeckInput | CardDeckCreateOrConnectWithoutDeckInput[]
    upsert?: CardDeckUpsertWithWhereUniqueWithoutDeckInput | CardDeckUpsertWithWhereUniqueWithoutDeckInput[]
    createMany?: CardDeckCreateManyDeckInputEnvelope
    set?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    disconnect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    delete?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    update?: CardDeckUpdateWithWhereUniqueWithoutDeckInput | CardDeckUpdateWithWhereUniqueWithoutDeckInput[]
    updateMany?: CardDeckUpdateManyWithWhereWithoutDeckInput | CardDeckUpdateManyWithWhereWithoutDeckInput[]
    deleteMany?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
  }

  export type CardDeckUncheckedUpdateManyWithoutDeckNestedInput = {
    create?: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput> | CardDeckCreateWithoutDeckInput[] | CardDeckUncheckedCreateWithoutDeckInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutDeckInput | CardDeckCreateOrConnectWithoutDeckInput[]
    upsert?: CardDeckUpsertWithWhereUniqueWithoutDeckInput | CardDeckUpsertWithWhereUniqueWithoutDeckInput[]
    createMany?: CardDeckCreateManyDeckInputEnvelope
    set?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    disconnect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    delete?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    update?: CardDeckUpdateWithWhereUniqueWithoutDeckInput | CardDeckUpdateWithWhereUniqueWithoutDeckInput[]
    updateMany?: CardDeckUpdateManyWithWhereWithoutDeckInput | CardDeckUpdateManyWithWhereWithoutDeckInput[]
    deleteMany?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
  }

  export type CardDeckCreateNestedManyWithoutCardInput = {
    create?: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput> | CardDeckCreateWithoutCardInput[] | CardDeckUncheckedCreateWithoutCardInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutCardInput | CardDeckCreateOrConnectWithoutCardInput[]
    createMany?: CardDeckCreateManyCardInputEnvelope
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutCardsInput = {
    create?: XOR<UserCreateWithoutCardsInput, UserUncheckedCreateWithoutCardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCardsInput
    connect?: UserWhereUniqueInput
  }

  export type ReviewLogCreateNestedManyWithoutCardInput = {
    create?: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput> | ReviewLogCreateWithoutCardInput[] | ReviewLogUncheckedCreateWithoutCardInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutCardInput | ReviewLogCreateOrConnectWithoutCardInput[]
    createMany?: ReviewLogCreateManyCardInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type CardDeckUncheckedCreateNestedManyWithoutCardInput = {
    create?: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput> | CardDeckCreateWithoutCardInput[] | CardDeckUncheckedCreateWithoutCardInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutCardInput | CardDeckCreateOrConnectWithoutCardInput[]
    createMany?: CardDeckCreateManyCardInputEnvelope
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
  }

  export type ReviewLogUncheckedCreateNestedManyWithoutCardInput = {
    create?: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput> | ReviewLogCreateWithoutCardInput[] | ReviewLogUncheckedCreateWithoutCardInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutCardInput | ReviewLogCreateOrConnectWithoutCardInput[]
    createMany?: ReviewLogCreateManyCardInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumCardStateFieldUpdateOperationsInput = {
    set?: $Enums.CardState
  }

  export type CardDeckUpdateManyWithoutCardNestedInput = {
    create?: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput> | CardDeckCreateWithoutCardInput[] | CardDeckUncheckedCreateWithoutCardInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutCardInput | CardDeckCreateOrConnectWithoutCardInput[]
    upsert?: CardDeckUpsertWithWhereUniqueWithoutCardInput | CardDeckUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: CardDeckCreateManyCardInputEnvelope
    set?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    disconnect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    delete?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    update?: CardDeckUpdateWithWhereUniqueWithoutCardInput | CardDeckUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: CardDeckUpdateManyWithWhereWithoutCardInput | CardDeckUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
  }

  export type UserUpdateOneRequiredWithoutCardsNestedInput = {
    create?: XOR<UserCreateWithoutCardsInput, UserUncheckedCreateWithoutCardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCardsInput
    upsert?: UserUpsertWithoutCardsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCardsInput, UserUpdateWithoutCardsInput>, UserUncheckedUpdateWithoutCardsInput>
  }

  export type ReviewLogUpdateManyWithoutCardNestedInput = {
    create?: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput> | ReviewLogCreateWithoutCardInput[] | ReviewLogUncheckedCreateWithoutCardInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutCardInput | ReviewLogCreateOrConnectWithoutCardInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutCardInput | ReviewLogUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: ReviewLogCreateManyCardInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutCardInput | ReviewLogUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutCardInput | ReviewLogUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type CardDeckUncheckedUpdateManyWithoutCardNestedInput = {
    create?: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput> | CardDeckCreateWithoutCardInput[] | CardDeckUncheckedCreateWithoutCardInput[]
    connectOrCreate?: CardDeckCreateOrConnectWithoutCardInput | CardDeckCreateOrConnectWithoutCardInput[]
    upsert?: CardDeckUpsertWithWhereUniqueWithoutCardInput | CardDeckUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: CardDeckCreateManyCardInputEnvelope
    set?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    disconnect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    delete?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    connect?: CardDeckWhereUniqueInput | CardDeckWhereUniqueInput[]
    update?: CardDeckUpdateWithWhereUniqueWithoutCardInput | CardDeckUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: CardDeckUpdateManyWithWhereWithoutCardInput | CardDeckUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
  }

  export type ReviewLogUncheckedUpdateManyWithoutCardNestedInput = {
    create?: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput> | ReviewLogCreateWithoutCardInput[] | ReviewLogUncheckedCreateWithoutCardInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutCardInput | ReviewLogCreateOrConnectWithoutCardInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutCardInput | ReviewLogUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: ReviewLogCreateManyCardInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutCardInput | ReviewLogUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutCardInput | ReviewLogUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type CardCreateNestedOneWithoutLogsInput = {
    create?: XOR<CardCreateWithoutLogsInput, CardUncheckedCreateWithoutLogsInput>
    connectOrCreate?: CardCreateOrConnectWithoutLogsInput
    connect?: CardWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutLogsInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    connect?: UserWhereUniqueInput
  }

  export type CardUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<CardCreateWithoutLogsInput, CardUncheckedCreateWithoutLogsInput>
    connectOrCreate?: CardCreateOrConnectWithoutLogsInput
    upsert?: CardUpsertWithoutLogsInput
    connect?: CardWhereUniqueInput
    update?: XOR<XOR<CardUpdateToOneWithWhereWithoutLogsInput, CardUpdateWithoutLogsInput>, CardUncheckedUpdateWithoutLogsInput>
  }

  export type UserUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    upsert?: UserUpsertWithoutLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLogsInput, UserUpdateWithoutLogsInput>, UserUncheckedUpdateWithoutLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumCardStateFilter<$PrismaModel = never> = {
    equals?: $Enums.CardState | EnumCardStateFieldRefInput<$PrismaModel>
    in?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    not?: NestedEnumCardStateFilter<$PrismaModel> | $Enums.CardState
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumCardStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CardState | EnumCardStateFieldRefInput<$PrismaModel>
    in?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.CardState[] | ListEnumCardStateFieldRefInput<$PrismaModel>
    not?: NestedEnumCardStateWithAggregatesFilter<$PrismaModel> | $Enums.CardState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCardStateFilter<$PrismaModel>
    _max?: NestedEnumCardStateFilter<$PrismaModel>
  }

  export type DeckCreateWithoutUserInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckCreateNestedManyWithoutDeckInput
  }

  export type DeckUncheckedCreateWithoutUserInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckUncheckedCreateNestedManyWithoutDeckInput
  }

  export type DeckCreateOrConnectWithoutUserInput = {
    where: DeckWhereUniqueInput
    create: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput>
  }

  export type DeckCreateManyUserInputEnvelope = {
    data: DeckCreateManyUserInput | DeckCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CardCreateWithoutUserInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckCreateNestedManyWithoutCardInput
    logs?: ReviewLogCreateNestedManyWithoutCardInput
  }

  export type CardUncheckedCreateWithoutUserInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckUncheckedCreateNestedManyWithoutCardInput
    logs?: ReviewLogUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardCreateOrConnectWithoutUserInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
  }

  export type CardCreateManyUserInputEnvelope = {
    data: CardCreateManyUserInput | CardCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ReviewLogCreateWithoutUserInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    card: CardCreateNestedOneWithoutLogsInput
  }

  export type ReviewLogUncheckedCreateWithoutUserInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: string
  }

  export type ReviewLogCreateOrConnectWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    create: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput>
  }

  export type ReviewLogCreateManyUserInputEnvelope = {
    data: ReviewLogCreateManyUserInput | ReviewLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DeckUpsertWithWhereUniqueWithoutUserInput = {
    where: DeckWhereUniqueInput
    update: XOR<DeckUpdateWithoutUserInput, DeckUncheckedUpdateWithoutUserInput>
    create: XOR<DeckCreateWithoutUserInput, DeckUncheckedCreateWithoutUserInput>
  }

  export type DeckUpdateWithWhereUniqueWithoutUserInput = {
    where: DeckWhereUniqueInput
    data: XOR<DeckUpdateWithoutUserInput, DeckUncheckedUpdateWithoutUserInput>
  }

  export type DeckUpdateManyWithWhereWithoutUserInput = {
    where: DeckScalarWhereInput
    data: XOR<DeckUpdateManyMutationInput, DeckUncheckedUpdateManyWithoutUserInput>
  }

  export type DeckScalarWhereInput = {
    AND?: DeckScalarWhereInput | DeckScalarWhereInput[]
    OR?: DeckScalarWhereInput[]
    NOT?: DeckScalarWhereInput | DeckScalarWhereInput[]
    id?: StringFilter<"Deck"> | string
    title?: StringFilter<"Deck"> | string
    description?: StringNullableFilter<"Deck"> | string | null
    color?: StringNullableFilter<"Deck"> | string | null
    isPublic?: BoolFilter<"Deck"> | boolean
    deletedAt?: DateTimeNullableFilter<"Deck"> | Date | string | null
    createdAt?: DateTimeFilter<"Deck"> | Date | string
    updatedAt?: DateTimeFilter<"Deck"> | Date | string
    userId?: StringFilter<"Deck"> | string
  }

  export type CardUpsertWithWhereUniqueWithoutUserInput = {
    where: CardWhereUniqueInput
    update: XOR<CardUpdateWithoutUserInput, CardUncheckedUpdateWithoutUserInput>
    create: XOR<CardCreateWithoutUserInput, CardUncheckedCreateWithoutUserInput>
  }

  export type CardUpdateWithWhereUniqueWithoutUserInput = {
    where: CardWhereUniqueInput
    data: XOR<CardUpdateWithoutUserInput, CardUncheckedUpdateWithoutUserInput>
  }

  export type CardUpdateManyWithWhereWithoutUserInput = {
    where: CardScalarWhereInput
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyWithoutUserInput>
  }

  export type CardScalarWhereInput = {
    AND?: CardScalarWhereInput | CardScalarWhereInput[]
    OR?: CardScalarWhereInput[]
    NOT?: CardScalarWhereInput | CardScalarWhereInput[]
    id?: StringFilter<"Card"> | string
    front?: StringFilter<"Card"> | string
    back?: StringFilter<"Card"> | string
    note?: StringNullableFilter<"Card"> | string | null
    nextReviewAt?: DateTimeFilter<"Card"> | Date | string
    interval?: IntFilter<"Card"> | number
    easeFactor?: FloatFilter<"Card"> | number
    repetitions?: IntFilter<"Card"> | number
    state?: EnumCardStateFilter<"Card"> | $Enums.CardState
    userId?: StringFilter<"Card"> | string
    createdAt?: DateTimeFilter<"Card"> | Date | string
    updatedAt?: DateTimeFilter<"Card"> | Date | string
  }

  export type ReviewLogUpsertWithWhereUniqueWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    update: XOR<ReviewLogUpdateWithoutUserInput, ReviewLogUncheckedUpdateWithoutUserInput>
    create: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput>
  }

  export type ReviewLogUpdateWithWhereUniqueWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    data: XOR<ReviewLogUpdateWithoutUserInput, ReviewLogUncheckedUpdateWithoutUserInput>
  }

  export type ReviewLogUpdateManyWithWhereWithoutUserInput = {
    where: ReviewLogScalarWhereInput
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyWithoutUserInput>
  }

  export type ReviewLogScalarWhereInput = {
    AND?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
    OR?: ReviewLogScalarWhereInput[]
    NOT?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
    id?: StringFilter<"ReviewLog"> | string
    rating?: IntFilter<"ReviewLog"> | number
    reviewTime?: IntFilter<"ReviewLog"> | number
    reviewedAt?: DateTimeFilter<"ReviewLog"> | Date | string
    scheduledDays?: IntFilter<"ReviewLog"> | number
    elapsedDays?: IntFilter<"ReviewLog"> | number
    lastEaseFactor?: FloatFilter<"ReviewLog"> | number
    newEaseFactor?: FloatFilter<"ReviewLog"> | number
    cardId?: StringFilter<"ReviewLog"> | string
    userId?: StringFilter<"ReviewLog"> | string
  }

  export type CardCreateWithoutCardDecksInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCardsInput
    logs?: ReviewLogCreateNestedManyWithoutCardInput
  }

  export type CardUncheckedCreateWithoutCardDecksInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: ReviewLogUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardCreateOrConnectWithoutCardDecksInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutCardDecksInput, CardUncheckedCreateWithoutCardDecksInput>
  }

  export type DeckCreateWithoutCardDecksInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDecksInput
  }

  export type DeckUncheckedCreateWithoutCardDecksInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type DeckCreateOrConnectWithoutCardDecksInput = {
    where: DeckWhereUniqueInput
    create: XOR<DeckCreateWithoutCardDecksInput, DeckUncheckedCreateWithoutCardDecksInput>
  }

  export type CardUpsertWithoutCardDecksInput = {
    update: XOR<CardUpdateWithoutCardDecksInput, CardUncheckedUpdateWithoutCardDecksInput>
    create: XOR<CardCreateWithoutCardDecksInput, CardUncheckedCreateWithoutCardDecksInput>
    where?: CardWhereInput
  }

  export type CardUpdateToOneWithWhereWithoutCardDecksInput = {
    where?: CardWhereInput
    data: XOR<CardUpdateWithoutCardDecksInput, CardUncheckedUpdateWithoutCardDecksInput>
  }

  export type CardUpdateWithoutCardDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCardsNestedInput
    logs?: ReviewLogUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateWithoutCardDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: ReviewLogUncheckedUpdateManyWithoutCardNestedInput
  }

  export type DeckUpsertWithoutCardDecksInput = {
    update: XOR<DeckUpdateWithoutCardDecksInput, DeckUncheckedUpdateWithoutCardDecksInput>
    create: XOR<DeckCreateWithoutCardDecksInput, DeckUncheckedCreateWithoutCardDecksInput>
    where?: DeckWhereInput
  }

  export type DeckUpdateToOneWithWhereWithoutCardDecksInput = {
    where?: DeckWhereInput
    data: XOR<DeckUpdateWithoutCardDecksInput, DeckUncheckedUpdateWithoutCardDecksInput>
  }

  export type DeckUpdateWithoutCardDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDecksNestedInput
  }

  export type DeckUncheckedUpdateWithoutCardDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateWithoutDecksInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    cards?: CardCreateNestedManyWithoutUserInput
    logs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDecksInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    cards?: CardUncheckedCreateNestedManyWithoutUserInput
    logs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDecksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDecksInput, UserUncheckedCreateWithoutDecksInput>
  }

  export type CardDeckCreateWithoutDeckInput = {
    card: CardCreateNestedOneWithoutCardDecksInput
  }

  export type CardDeckUncheckedCreateWithoutDeckInput = {
    cardId: string
  }

  export type CardDeckCreateOrConnectWithoutDeckInput = {
    where: CardDeckWhereUniqueInput
    create: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput>
  }

  export type CardDeckCreateManyDeckInputEnvelope = {
    data: CardDeckCreateManyDeckInput | CardDeckCreateManyDeckInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutDecksInput = {
    update: XOR<UserUpdateWithoutDecksInput, UserUncheckedUpdateWithoutDecksInput>
    create: XOR<UserCreateWithoutDecksInput, UserUncheckedCreateWithoutDecksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDecksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDecksInput, UserUncheckedUpdateWithoutDecksInput>
  }

  export type UserUpdateWithoutDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cards?: CardUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cards?: CardUncheckedUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CardDeckUpsertWithWhereUniqueWithoutDeckInput = {
    where: CardDeckWhereUniqueInput
    update: XOR<CardDeckUpdateWithoutDeckInput, CardDeckUncheckedUpdateWithoutDeckInput>
    create: XOR<CardDeckCreateWithoutDeckInput, CardDeckUncheckedCreateWithoutDeckInput>
  }

  export type CardDeckUpdateWithWhereUniqueWithoutDeckInput = {
    where: CardDeckWhereUniqueInput
    data: XOR<CardDeckUpdateWithoutDeckInput, CardDeckUncheckedUpdateWithoutDeckInput>
  }

  export type CardDeckUpdateManyWithWhereWithoutDeckInput = {
    where: CardDeckScalarWhereInput
    data: XOR<CardDeckUpdateManyMutationInput, CardDeckUncheckedUpdateManyWithoutDeckInput>
  }

  export type CardDeckScalarWhereInput = {
    AND?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
    OR?: CardDeckScalarWhereInput[]
    NOT?: CardDeckScalarWhereInput | CardDeckScalarWhereInput[]
    cardId?: StringFilter<"CardDeck"> | string
    deckId?: StringFilter<"CardDeck"> | string
  }

  export type CardDeckCreateWithoutCardInput = {
    deck: DeckCreateNestedOneWithoutCardDecksInput
  }

  export type CardDeckUncheckedCreateWithoutCardInput = {
    deckId: string
  }

  export type CardDeckCreateOrConnectWithoutCardInput = {
    where: CardDeckWhereUniqueInput
    create: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput>
  }

  export type CardDeckCreateManyCardInputEnvelope = {
    data: CardDeckCreateManyCardInput | CardDeckCreateManyCardInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutCardsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckCreateNestedManyWithoutUserInput
    logs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCardsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckUncheckedCreateNestedManyWithoutUserInput
    logs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCardsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCardsInput, UserUncheckedCreateWithoutCardsInput>
  }

  export type ReviewLogCreateWithoutCardInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    user: UserCreateNestedOneWithoutLogsInput
  }

  export type ReviewLogUncheckedCreateWithoutCardInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    userId: string
  }

  export type ReviewLogCreateOrConnectWithoutCardInput = {
    where: ReviewLogWhereUniqueInput
    create: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput>
  }

  export type ReviewLogCreateManyCardInputEnvelope = {
    data: ReviewLogCreateManyCardInput | ReviewLogCreateManyCardInput[]
    skipDuplicates?: boolean
  }

  export type CardDeckUpsertWithWhereUniqueWithoutCardInput = {
    where: CardDeckWhereUniqueInput
    update: XOR<CardDeckUpdateWithoutCardInput, CardDeckUncheckedUpdateWithoutCardInput>
    create: XOR<CardDeckCreateWithoutCardInput, CardDeckUncheckedCreateWithoutCardInput>
  }

  export type CardDeckUpdateWithWhereUniqueWithoutCardInput = {
    where: CardDeckWhereUniqueInput
    data: XOR<CardDeckUpdateWithoutCardInput, CardDeckUncheckedUpdateWithoutCardInput>
  }

  export type CardDeckUpdateManyWithWhereWithoutCardInput = {
    where: CardDeckScalarWhereInput
    data: XOR<CardDeckUpdateManyMutationInput, CardDeckUncheckedUpdateManyWithoutCardInput>
  }

  export type UserUpsertWithoutCardsInput = {
    update: XOR<UserUpdateWithoutCardsInput, UserUncheckedUpdateWithoutCardsInput>
    create: XOR<UserCreateWithoutCardsInput, UserUncheckedCreateWithoutCardsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCardsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCardsInput, UserUncheckedUpdateWithoutCardsInput>
  }

  export type UserUpdateWithoutCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUncheckedUpdateManyWithoutUserNestedInput
    logs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ReviewLogUpsertWithWhereUniqueWithoutCardInput = {
    where: ReviewLogWhereUniqueInput
    update: XOR<ReviewLogUpdateWithoutCardInput, ReviewLogUncheckedUpdateWithoutCardInput>
    create: XOR<ReviewLogCreateWithoutCardInput, ReviewLogUncheckedCreateWithoutCardInput>
  }

  export type ReviewLogUpdateWithWhereUniqueWithoutCardInput = {
    where: ReviewLogWhereUniqueInput
    data: XOR<ReviewLogUpdateWithoutCardInput, ReviewLogUncheckedUpdateWithoutCardInput>
  }

  export type ReviewLogUpdateManyWithWhereWithoutCardInput = {
    where: ReviewLogScalarWhereInput
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyWithoutCardInput>
  }

  export type CardCreateWithoutLogsInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckCreateNestedManyWithoutCardInput
    user: UserCreateNestedOneWithoutCardsInput
  }

  export type CardUncheckedCreateWithoutLogsInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cardDecks?: CardDeckUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardCreateOrConnectWithoutLogsInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutLogsInput, CardUncheckedCreateWithoutLogsInput>
  }

  export type UserCreateWithoutLogsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckCreateNestedManyWithoutUserInput
    cards?: CardCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLogsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    decks?: DeckUncheckedCreateNestedManyWithoutUserInput
    cards?: CardUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
  }

  export type CardUpsertWithoutLogsInput = {
    update: XOR<CardUpdateWithoutLogsInput, CardUncheckedUpdateWithoutLogsInput>
    create: XOR<CardCreateWithoutLogsInput, CardUncheckedCreateWithoutLogsInput>
    where?: CardWhereInput
  }

  export type CardUpdateToOneWithWhereWithoutLogsInput = {
    where?: CardWhereInput
    data: XOR<CardUpdateWithoutLogsInput, CardUncheckedUpdateWithoutLogsInput>
  }

  export type CardUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUpdateManyWithoutCardNestedInput
    user?: UserUpdateOneRequiredWithoutCardsNestedInput
  }

  export type CardUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUncheckedUpdateManyWithoutCardNestedInput
  }

  export type UserUpsertWithoutLogsInput = {
    update: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
  }

  export type UserUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUpdateManyWithoutUserNestedInput
    cards?: CardUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decks?: DeckUncheckedUpdateManyWithoutUserNestedInput
    cards?: CardUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DeckCreateManyUserInput = {
    id?: string
    title: string
    description?: string | null
    color?: string | null
    isPublic?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CardCreateManyUserInput = {
    id?: string
    front: string
    back: string
    note?: string | null
    nextReviewAt?: Date | string
    interval?: number
    easeFactor?: number
    repetitions?: number
    state?: $Enums.CardState
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewLogCreateManyUserInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    cardId: string
  }

  export type DeckUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUpdateManyWithoutDeckNestedInput
  }

  export type DeckUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUncheckedUpdateManyWithoutDeckNestedInput
  }

  export type DeckUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CardUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUpdateManyWithoutCardNestedInput
    logs?: ReviewLogUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cardDecks?: CardDeckUncheckedUpdateManyWithoutCardNestedInput
    logs?: ReviewLogUncheckedUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    front?: StringFieldUpdateOperationsInput | string
    back?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    nextReviewAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: IntFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitions?: IntFieldUpdateOperationsInput | number
    state?: EnumCardStateFieldUpdateOperationsInput | $Enums.CardState
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    card?: CardUpdateOneRequiredWithoutLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
  }

  export type ReviewLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
  }

  export type CardDeckCreateManyDeckInput = {
    cardId: string
  }

  export type CardDeckUpdateWithoutDeckInput = {
    card?: CardUpdateOneRequiredWithoutCardDecksNestedInput
  }

  export type CardDeckUncheckedUpdateWithoutDeckInput = {
    cardId?: StringFieldUpdateOperationsInput | string
  }

  export type CardDeckUncheckedUpdateManyWithoutDeckInput = {
    cardId?: StringFieldUpdateOperationsInput | string
  }

  export type CardDeckCreateManyCardInput = {
    deckId: string
  }

  export type ReviewLogCreateManyCardInput = {
    id?: string
    rating: number
    reviewTime: number
    reviewedAt?: Date | string
    scheduledDays: number
    elapsedDays: number
    lastEaseFactor: number
    newEaseFactor: number
    userId: string
  }

  export type CardDeckUpdateWithoutCardInput = {
    deck?: DeckUpdateOneRequiredWithoutCardDecksNestedInput
  }

  export type CardDeckUncheckedUpdateWithoutCardInput = {
    deckId?: StringFieldUpdateOperationsInput | string
  }

  export type CardDeckUncheckedUpdateManyWithoutCardInput = {
    deckId?: StringFieldUpdateOperationsInput | string
  }

  export type ReviewLogUpdateWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ReviewLogUncheckedUpdateManyWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    reviewTime?: IntFieldUpdateOperationsInput | number
    reviewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduledDays?: IntFieldUpdateOperationsInput | number
    elapsedDays?: IntFieldUpdateOperationsInput | number
    lastEaseFactor?: FloatFieldUpdateOperationsInput | number
    newEaseFactor?: FloatFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}