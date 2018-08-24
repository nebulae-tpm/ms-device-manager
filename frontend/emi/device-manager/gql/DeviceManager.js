import gql from "graphql-tag";

// We use the gql tag to parse our query string into a query document

//Hello world sample, please remove
export const getHelloWorld = gql`
  query getHelloWorldFrommsnamecamel{
    getHelloWorldFrommsnamecamel{
      sn
    }
  }
`;
export const getTagByPages = gql`
  query getTagsByPages($page: Int!, $count: Int!) {
    getTags(page: $page, count: $count) {
      name
      type
      attributes {
        key
        value
      }
    }
  }
`;

//Hello world sample, please remove
export const DeviceManagerHelloWorldSubscription = gql`
  subscription{
    msnamecamelHelloWorldSubscription{
      sn
  }
}`;
