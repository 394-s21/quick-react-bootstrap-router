/* globals cy */

describe ('Test App', () => {

  it ('launches', () => {
    cy.visit ('/');
  });

  it ('opens with Fall CS courses', () => {
    cy.visit ('/');
    cy.get('[data-cy=course]').should('contain', 'Fall CS');
  });

  it('shows Winter courses when Winter is selected', () => {
    cy.visit ('/');
    cy.get('[data-cy=Winter]').click();
    cy.get('[data-cy=course]').should('contain' ,'Winter');
  });

  it('shows Sign Out for logged in user', () => {
    cy.visit('/');
    cy.contains('Sign Out');
  })

  it('shows Sign In after signing out', () => {
    cy.visit('/');
    cy.contains('Sign Out').click();
    cy.contains('Sign In');
    cy.contains('Sign Out').should('not.exist');
  })
});
