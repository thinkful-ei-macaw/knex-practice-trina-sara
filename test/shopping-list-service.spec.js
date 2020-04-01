const knex = require('knex')
const ShoppingListService = require('../src/shopping-list-service')

describe('ShoppingList service object', () => {
  let db;

  const testItems = [
    {
      id: 1,
      name: 'First test post',
      price: '1.99',
      category: 'Main',
      checked: true,
      date_added: new Date
    },
    {
      id: 2,
      name: 'Second test post',
      price: '2.99',
      category: 'Lunch',
      checked: false,
      date_added: new Date
    },
    {
      id: 3,
      name: 'Third test post',
      price: '1.99',
      category: 'Main',
      checked: false,
      date_added: new Date
    }
  ]

  before('setup db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
  })

  before('clean db', () => db('shopping_list').truncate())
  afterEach('clean db', () => db('shopping_list').truncate())

  after('destroy db connection', () => db.destroy())

  describe('getAllItems()', () => {
    it('returns an empty array', () => {
      return ShoppingListService
        .getAllItems(db)
        .then(items => expect(items).to.eql([]))
    })

    context('with data present', () => {
      beforeEach('insert test items', () => 
      db('shopping_list')
        .insert(testItems)
      )

      it('returns all test items', () => {
        return ShoppingListService
          .getAllItems(db)
          .then(items => expect(items).to.eql(testItems))
      })
    })
  })

  describe('insertItem()', () => {
    it('inserts record in db and returns item with new id', () => {

      const newItem =
      {
        name: 'Test new title',
        price: '0.99',
        category: 'Lunch',
        checked: false,
        date_added: new Date
      }

      return ShoppingListService.insertItem(db, newItem)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            name: newItem.name,
            price: newItem.price,
            category: newItem.category,
            checked: newItem.checked,
            date_added: newItem.date_added
          })
        })
    })

    it('throws not-null constraint error if name is not provided', () => {

      const newItem =
      {
        price: '0.99',
        category: 'Lunch',
        checked: false,
        date_added: new Date
      }

      return ShoppingListService
        .insertItem(db, newItem)
        .then( 
          () => expect.fail('db should throw error'),
          err => expect(err.message).to.include('not-null')
        )
    })
  })

  describe('getById', () => {
    it('should return undefined', () => {
      return ShoppingListService.getById(db, 999)
        .then(item => expect(item).to.be.undefined)
    })

    context('with data present', () => {
      before('insert items', () => 
        db('shopping_list')
          .insert(testItems)
      )

      it('should return existing item', () => {
        const expectedItemId = 3
        const expectedItem = testItems.find(a => a.id === expectedItemId)
        return ShoppingListService.getById(db, expectedItemId)
          .then(actual => expect(actual).to.eql(expectedItem))
      })
    })
  })

  describe('deleteItem()', () => {
    it('shoul return 0 rows affected', () => {
      return ShoppingListService
        .deleteItem(db, 999)
        .then(rowsAffected => expect(rowsAffected).to.eq(0))
    })

    context('with data present', () => {
      before('insert items', () => 
        db('shopping_list')
          .insert(testItems)
      )

      it('should return 1 row affected and record is removed from db', () => {
        const deletedItemId = 1

        return ShoppingListService
          .deleteItem(db, deletedItemId)
          .then(rowsAffected => {
            expect(rowsAffected).to.eq(1)
            return db('shopping_list').select('*')
          })
          .then(actual => {
            const expected = testItems.filter(a => a.id !== deletedItemId)
            expect(actual).to.eql(expected)
          })
      })
    })
  })

  describe('updateItem', () => {
    it('should return 0 rows affected', () => {
      return ShoppingListService
        .updateItem(db, 999, { name: 'new name!'})
        .then(rowsAffected => expect(rowsAffected).to.eq(0))
    })

    context('with data present', () => {
      before('insert articles', () => 
      db('shopping_list')
      .insert(testItems)
      )

      it('should successfully update an article', () => {
        const updatedItemId = 1
        const testItem = testItems.find(a => a.id === updatedItemId)
        const updatedItem = {...testItem, name: 'new name!'}

        return ShoppingListService
          .updateItem(db, updatedItemId, updatedItem)
          .then(rowsAffected => {
            expect(rowsAffected).to.eq(1)
            return db('shopping_list').select('*').where({ id: updatedItemId }).first()
          })
          .then(item => {
            expect(item).to.eql(updatedItem)
          })
      })
    })
  })


})