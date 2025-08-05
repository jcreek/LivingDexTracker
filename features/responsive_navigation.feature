Feature: Responsive Navigation
  As a user on any device
  I want the navigation to work responsively
  So that I can access all features on mobile and desktop

  Background:
    Given the application is running on the local development server

  Scenario: Desktop navigation is visible
    Given I am using a desktop browser
    When I navigate to any page
    Then I should see the navigation menu
    And I should see all navigation links
    And the navigation should be horizontal

  Scenario: Mobile navigation has hamburger menu
    Given I am using a mobile viewport
    When I navigate to any page
    Then I should see a hamburger menu button
    When I click the hamburger menu
    Then I should see the mobile navigation menu
    And I should see all navigation links

  Scenario: Navigation links work correctly
    Given I am on any page
    When I click the "Home" navigation link
    Then I should be on the home page
    When I click the "Pokédexes" navigation link
    Then I should be on the pokédexes page
    When I click the "MyDex" navigation link
    Then I should be on the MyDex page
    When I click the "Profile" navigation link
    Then I should be on the profile page
    When I click the "About" navigation link
    Then I should be on the about page

  Scenario: Current page is highlighted in navigation
    Given I am on the home page
    Then the "Home" navigation link should be highlighted as current
    When I navigate to the pokédexes page
    Then the "Pokédexes" navigation link should be highlighted as current

  Scenario: Sign in/out links work correctly
    Given I am on any page
    When I click the "Sign In" link
    Then I should be on the sign-in page