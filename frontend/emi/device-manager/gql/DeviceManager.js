import gql from "graphql-tag";

// We use the gql tag to parse our query string into a query document



export const getAllTagTypes = gql`
query getTagTypes{
  deviceManagerGetTagTypes
}`;

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



export const PersistBasicInfoTag = gql`
  mutation persistBasicInfoTag($input: BasicInfoTag) {
    persistBasicInfoTag(input: $input) {
      code
      message
    }
  }
`;

export const EditBAsicTagInfo = gql`
  mutation editBasicTagInfo($tagName: String!, $input: BasicInfoTag!) {
    deviceManagerEditBasicTagInfo(tagName: $tagName, input: $input) {
      code
      message
    }
  }
`;

export const RemoveTag = gql`
  mutation removeTag($tagName: String!) {
    deviceManagerDeleteTag(tagName: $tagName) {
      code
      message
    }
  }
`;

export const RemoveTagAttribute = gql`
  mutation removeTagAttribute($tagName: String!, $tagAttributeName: String!) {
    deviceManagerDeleteTagAttribute(
      tagName: $tagName
      tagAttributeName: $tagAttributeName
    ) {
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
  }`;

export const editTagAttribute = gql`
  mutation editTagAttribute(
  $tagName: String!, $tagAttributeName: String!, $input: TagAttribute!){
	deviceManagerEditTagAttribute(
    tagName: $tagName,
    tagAttributeName: $tagAttributeName
    input: $input
  ){
    code
    message
  }
}`;

