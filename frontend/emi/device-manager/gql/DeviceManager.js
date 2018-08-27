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

export const PersistBasicInfoTag = gql`
  mutation persistBasicInfoTag($input: BasicInfoTag) {
    persistBasicInfoTag(input: $input) {
      code
      message
    }
  }
`;

export const addAttributeToTag = gql`
  mutation addAttributeToTag($tagName: String!, $input: TagAttribute) {
    deviceManagerAddAttributeToTag(tagName: $tagName, input: $input) {
      code
      message
    }
  }
`;
