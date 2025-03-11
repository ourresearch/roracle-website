

# RORacle UI

## Context

This is an application that takes affiliation strings from the metadata of scholarly journal articles and does named entity recognition to discover individual scholarly organizations named in those strings. It returns the ROR ID for each organization it discovers. 

I already built the API that does this. The API has an endpoint that takes an affiliation string and returns a list of varieties. It also has an endpoint that runs a test suite. Before you write any code, you need to check out the API a bit. There are three things you must do: 

First, make sure that you examine the documentation for the API, which you can find here: [https://api.roracle.org/docs](https://api.roracle.org/docs).

Second, make sure that you try an example API call. Here's a good example: [https://api.roracle.org/ror-records?affiliation=MIT,Cambridge%20MA,University%20of%20florida](https://api.roracle.org/ror-records?affiliation=MIT,Cambridge%20MA,University%20of%20florida)

 As you can see, the API takes an affiliation string and returns two ROR records. 

Third and finally, run the test suite API endpoint. Pay close attention to how the test results are formatted, including metadata about test performance. That endpoint is here: [https://api.roracle.org/tests](https://api.roracle.org/tests)

## Goals

The goal of this application is to provide a website that lets people use the API. There are two main user routes through the website.

1. **Get RORs**: first is to paste an affiliation string or a list of affiliation strings separated by new lines into a text box, then get a list of results.   
2. **Run Tests:** second is to run the test suite and get a list of test results, as well as overall performance states.

## Views

### Landing page

On the landing page, the user sees a text box where they can paste their affiliation strings. They can click a button to say submit, or they can submit with Cmd \+ Enter.   There is also a button that lets them run tests. 

### ROR results

This is a list results from the ror-records endpoint. Each result is a card. Each card has two sections. On the top is the affiliation. Underneath the affiliation is a list of organizations. Each organization is represented as a tag. The tag has a name that's displayed, and that name is the name of the organization. If you click on the tag it will link you to that organization's page on the ROR website. This is easy to do because the canonical form of a ROR ID is a hyperlink which resolves to the organization's page on the ROR website.  The link will open in a new tab. If you hover over the tag, you will see a pop-up showing a list of that organization's alternate names. 

Above the list of cards are basic stats: How many affiliations were returned? How many organizations? What is the average number of organizations per record? There's also a button to download the results as CSV. The CSV has one column for the affiliation and another column for the ROR IDs found. ROR IDs are separated by spaces in that column. 

### Test results

This is a list of test results. Each test result is represented by a card. On the very top of the card is the ID of that test result and the dataset. These are in very small print. The next thing on the card is the affiliation. This is big. Finally, below the affiliation, is a list of matches. Each match is a ROR organization, same as in the results page. It looks like a tag and it has the name of the organization. If you click the tag, it takes you to the correct page on the ROR website. The matches are colored green. 

Beneath the matches there is a list of under-matched organizations. These look exactly the same as the matches, only they are colored orange. Finally, beneath these, there is a list of overmatched organizations. These are the same, but they are colored red. 

Just as in the results page, if you hover over an organization tag, you will see a list of that organization's alternate names from the API. 

Above the test results there's a page header and in that page header you can find statistics about the tests run. The statistics are grouped by dataset. There is one statistic block per dataset.  Each statistic block includes the precision and recall, the count of tests, and the average number of ROR IDs per string.

In the page header, you will also find the ability to filter the tests. You can filter by dataset. When you filter by dataset, there is a dropdown, and you simply select which datasets you want to see. There's a checkmark next to each dataset. You can select all of them, just a few, or just one. 

You can also filter by error status. There are three options here:

1. You can see tests that have no errors  
2. You can see tests that have under matches  
3. You can see tests that have over matches

Finally, in the header, you're able to sort. You can sort by affiliation length in characters. You can sort by random, you can sort by error status, or you can sort by test ID. Sorting by error status shows cards with no errors, then cards with overmatches, and finally cards with undermatches. In any sort, if there are ties, ties are broken by test ID. 

## Stack

The application has no persistent state. Whatever you see on the web page is what you get. So there's no database. 

It's built in Vue using Vite. Components are all rendered using the shcadcn library.

It will be deployed using Vercel. Don’t worry about deployment though till it’s done and working well locally.

