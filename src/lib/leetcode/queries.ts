export const PROBLEM_LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        questionId: questionFrontendId
        title
        titleSlug
        difficulty
        isPaidOnly
        topicTags {
          name
          slug
        }
      }
    }
  }
`;

export const PROBLEM_DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId: questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
      content
      hints
      topicTags {
        name
        slug
      }
      codeSnippets {
        lang
        langSlug
        code
      }
      exampleTestcaseList
    }
  }
`;
