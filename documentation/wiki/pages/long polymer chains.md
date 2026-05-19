# [Display long chain polymers] As Ketcher User I want to see the long polymer chains on the canvas

| As                          | I want                         | so that                                                      |
| :-------------------------- | :----------------------------- | :----------------------------------------------------------- |
| Ketcher peptide editor user | to see the long polymer chains | I can see as much individual monomers with letter level detailisation as possible in readable format |

#### 1. Context

Glossary: [Peptide Glossary](https://github.com/epam/ketcher/wiki/Polymer-Glossary)

Users might want to work with relatively large >1k sequences on the canvas. This an be RNA, Peptide type polymers or combination of both. The polymers can have complex structures. Cycles Loops, Branches are suitable. We are discussing here only linear cases.

​	This might be needed due to:

- Formal requirement to present a detailed polymer structure by a regulatory authorities, scientific journals
- Need to mark and display differences between similar sequences
- Using in educational purposes

In order to do so our approach is to:

- fit a rectangle each individual polymer
- Present individual monomers in 'snake' form
- Aspect ratio of individual rectangles should be adjustable by the user
- individual monomers in snake from will be depicted in group of 10 monomers in a row
- Individual monomers would be numbered at the beginning of each ten and row

**If user is drawing on canvas we do not apply a snake fit, so that a rectangle**

#### 3. Assumptions

| **ID** | **Assumption**                                               |
| ------ | ------------------------------------------------------------ |
| 1      | Ketcher Polymer Editor users are interested in display as much individual monomers with letter level details as possible |
| 2      | We are focusing on display only in linear cases, representation of  Cycles Loops, Branches will be defined later |
| 3      | Ketcher visualizations will be used for later annotation and editing by end-users in third-party software |

####  4. Additional information (optional)

Zoom ratio is 100%

Manual placing of individual monomer feature might be implemented.

Decision on whether the polymer will be visible or not is made by the system based on canvas size.

line form: ![Line form](https://github.com/epam/ketcher/blob/master/documentation/wiki/line%20form.png)

single bar snake form: ![multibar snake](https://github.com/epam/ketcher/blob/master/documentation/wiki/single%20bar%20snake.png)

Multiple bar snake form: ![single bar snake](https://github.com/epam/ketcher/blob/master/documentation/wiki/miltibar%20snake.png)



#### 8. Acceptance Criteria



| **#** | **User Group**              | **GIVEN**                                                    | **WHEN**                                  | **THEN**                                          |
| ----- | --------------------------- | ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| All   | Ketcher polymer editor User | Polymer editor mode of the Ketcher enabled<br />A compatible file with linear polymer is available<br />Canvas is empty | opening the file or <br />adding sequence | Polymer is visible in monomer level  detail       |
| 1     |                             | The polymer size allow it to fit into the canvas into a single line  with detailed visibility<br /> |                                           | Polymer is shown in line form                     |
| 2     |                             | The polymer size doesn't allow it to fit into the canvas into a single line <br /> |                                           | Polymer is shown in snake form                    |
| 3     |                             | The polymer size allows it to be visible in single bar snake form <br /> |                                           | The polymer is shown in a single bar snake form   |
| 4     |                             | The polymer size doesn't allow it to be visible in single bar snake form <br /> |                                           | The polymer is shown in a multiple bar snake form |
