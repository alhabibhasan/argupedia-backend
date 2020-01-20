const assert = require('assert')
const {getThread} = require('../../../api/arguments/read/threader')

const mockThread = {
    "thread": {
      "node": {
        "id": "144"
      },
      "attackers": [
        {
          "node": {
            "id": "145"
          },
          "attackers": [
            {
              "node": {
                "id": "124"
              },
              "attackers": [
                {
                  "node": {
                    "id": "146"
                  },
                  "attackers": []
                },
                {
                  "node": {
                    "id": "147"
                  },
                  "attackers": []
                }
              ]
            }
          ]
        },
        {
          "node": {
            "id": "125"
          },
          "attackers": [
            {
              "node": {
                "id": "148"
              },
              "attackers": []
            }
          ]
        },
        {
          "node": {
            "id": "126"
          },
          "attackers": []
        },
        {
          "node": {
            "id": "127"
          },
          "attackers": []
        },
        {
          "node": {
            "id": "128"
          },
          "attackers": []
        },
        {
          "node": {
            "id": "129"
          },
          "attackers": []
        },
        {
          "node": {
            "id": "130"
          },
          "attackers": [
            {
              "node": {
                "id": "149"
              },
              "attackers": [
                {
                  "node": {
                    "id": "131"
                  },
                  "attackers": []
                }
              ]
            }
          ]
        }
      ]
    }
  }

const mockNodesWithAttacker = [
    {
      node: { id: "144" },
      attackers: [
        {
          id: "145"
        },
        {
          id: "125"
        },
        {
          id: "126"
        },
        {
          id: "127"
        },
        {
          id: "128"
        },
        {
          id: "129"
        },
        {
          id: "130"
        }
      ]
    },
    {
      node: {
        id: "145",
      },
      attackers: [
        {
          id: "124"
        }
      ]
    },
    {
      node: {
        id: "124",
      },
      attackers: [
        {
          id: "146"
        },
        {
          id: "147"
        }
      ]
    },
    {
      node: {
        id: "146",
      },
      attackers: []
    },
    {
      node: {
        id: "147",
      },
      attackers: []
    },
    {
      node: {
        id: "125",
      },
      attackers: [
        {
          id: "148"
        }
      ]
    },
    {
      node: {
        id: "148",
      },
      attackers: []
    },
    {
      node: {
        id: "126",
      },
      attackers: []
    },
    {
      node: {
        id: "127",
      },
      attackers: []
    },
    {
      node: {
        id: "128",
      },
      attackers: []
    },
    {
      node: {
        id: "129",
      },
      attackers: []
    },
    {
      node: {
        id: "130",
      },
      attackers: [
        {
          id: "149"
        }
      ]
    },
    {
      node: {
        id: "149",
      },
      attackers: [
        {
          id: "131"
        }
      ]
    },
    {
      node: {
        id: "131",
      },
      attackers: []
    }
  ]

describe('Thread generation algorithm', () => {
    describe('#getThread', () => {
        it ('should correctly generate a threaded post given a set of nodes with their attackers', () => {
            let thread = getThread(144, mockNodesWithAttacker)
            assert.deepEqual(thread, mockThread.thread)
        })
    })
})